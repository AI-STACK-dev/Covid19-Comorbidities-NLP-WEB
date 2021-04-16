#!/home/jsu/Desktop/jsu/jang/bin python
import random
import numpy as np 
import pandas as pd
import glob
import json
import os
import re
import time

import nltk
from nltk import word_tokenize,sent_tokenize
from nltk.stem  import PorterStemmer

from nltk.corpus import stopwords
from nltk.stem import SnowballStemmer

if __name__=='__main__':
    pass
#!/home/jsu/Desktop/jsu/jang/bin python
import random
import numpy as np 
import pandas as pd
import glob
import json
import os
import re
import time
import sys

import nltk
from nltk import word_tokenize,sent_tokenize
from nltk.stem  import PorterStemmer
from nltk.corpus import stopwords
from nltk.stem import SnowballStemmer

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

import torch
from transformers import  AutoTokenizer,AutoModelForQuestionAnswering

args = sys.argv
args = [i for i in args[1:-1]]

## stopwords
stops = stopwords.words("english")
snowstem = SnowballStemmer("english")
portstem = PorterStemmer()

## number of documents
N = 10

## number of prints
n = 2

# remove punc
def removepunc(my_str):
    punctuations = '''!()-[]{};:'"\,<>./?@#$%^&*_~'''
    no_punct = ""
    for char in my_str:
        if char not in punctuations:
            no_punct = no_punct + char
    return no_punct

# include number?
def hasNumbers(inputString):
    return (bool(re.search(r'\d', inputString)))

# ask
def ask(question,context,idx):
    input_ids = tokenizer.encode(question, context)
    sep_index = input_ids.index(tokenizer.sep_token_id)
    
    num_seg_a = sep_index + 1
    num_seg_b = len(input_ids) - num_seg_a
    segment_ids = [0]*num_seg_a + [1]*num_seg_b
    assert len(segment_ids) == len(input_ids)
    
    tokens = tokenizer.convert_ids_to_tokens(input_ids)
    
    with torch.no_grad():
        A = torch.tensor([input_ids]).to('cuda')
        B = torch.tensor([segment_ids]).to('cuda')
        output = model(A, token_type_ids=B) # The segment IDs to differentiate question from answer_text
    

    
    start_scores = output.start_logits
    end_scores = output.end_logits
    
    answer_end = 0
    answer_start = torch.argmax(start_scores)
    answer_ends = torch.argsort(end_scores).cpu().numpy()[::-1]
    for i in answer_ends[0]:
        if answer_start<= i:
            answer_end= i
    answer = ' '.join(tokens[answer_start:answer_end+1])
    answer = answer.replace(" ##","").replace("[CLS] ","")

    ## for GPU 
    del A,B,output
    torch.cuda.empty_cache()
    pack = [answer,
            (torch.max(start_scores)+end_scores[0][answer_end]),
            context,
            idx]
    
    return pack

# answer
def getanswers(question,tokenizer,model,df_,vectorizer):
    processedQuestion =   " ".join([snowstem.stem(i) for i in word_tokenize(removepunc(question)) if i not in stops])
    vector = vectorizer.transform([processedQuestion])
    questionSimilarityMatrix = cosine_similarity(vector,encArticles)
    ques_top_n = np.argsort(questionSimilarityMatrix[0])[-N:][::-1]
    
    #한 문단 최대 character 수: 
    questions= []
    contexts= []
    idxs = []
    for t in ques_top_n:
        bd = df_.body_text[t]
        para =[i for i in bd.split('\n')]
        for nump,p in enumerate(para):
            if len(p) < 30:
                continue
                
            alp=len(p)//500
            if alp >= 1:
                for a in range(alp+1):
                    last = (a+1)*500
                    if a == alp:
                        last = len(p)
                    pp = p[a*500:last]
                    contexts.append(pp)
                    questions.append(question)
                    idxs.append((t,nump,a,alp+1))                    
            else:
                contexts.append(p)
                questions.append(question)
                idxs.append((t,nump,0,1))       
                 
    answers = []
    for  question, context, idx in zip(questions,contexts,idxs):
        result = ask(question,context,idx)
        if len(result[0]) < 7 or "[CLS]" in result[0] :
            continue
        answers.append(result)
    answers = np.array(answers)

    return answers


if __name__=='__main__':
    print('Im started')

    while(1):
        for line in sys.stdin.readlines():
            print(line)
    # ## load csv
    # csv_path = '/mnt/j/cst2021/cord19_final.csv'
    # df = pd.read_csv(csv_path)

    # # ## TF-IDF fitting
    # vectorizer = TfidfVectorizer()
    # encArticles = vectorizer.fit_transform(df.usetxt)

    # # ## load tokenizer, models 
    # tokenizer = AutoTokenizer.from_pretrained("/mnt/j/cst2021/model/")
    # model = AutoModelForQuestionAnswering.from_pretrained("/mnt/j/cst2021/model/")
    # model.to('cuda')
    

    start = time.perf_counter()
    for question in args:
        question = f'is {question.lower()} at risk ?'
        print("\n\n=================================================\n\n")
        print("Query:",question)
        print(f"\nTop {n} most similar sentences in corpus:")
        answers = getanswers(question,stops,snowstem,df,vectorizer)
        for i in np.argsort(answers[:,1])[-n:][::-1]:
            ans = answers[i,0]
            score = answers[i,1]
            idx = answers[i,3]

            #using idx
            title = df.title[idx[0]]
            date = df.publish_time[idx[0]]

            print(f"Score: {score:.4f}")
            print(f"Title: {title}")
            print(f"Date: {date}")
            print(f"Text: {ans}\n")

    print(f"time: {time.perf_counter()-start:.4f}s")
