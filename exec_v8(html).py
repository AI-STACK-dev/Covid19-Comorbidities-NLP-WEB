import random
import numpy as np 
import pandas as pd
import glob
import json
import os
import re
import time
import sys
import pickle

import nltk
from nltk import word_tokenize,sent_tokenize
from nltk.stem  import PorterStemmer
from nltk.corpus import stopwords
from nltk.stem import SnowballStemmer

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

import torch
from transformers import  AutoTokenizer,AutoModelForQuestionAnswering

from rank_bm25 import BM25Okapi


args = sys.argv
if args[-1]=='':
    args = args[:-1]
num_prints = int(args[-1])
args = [i for i in args[1:-1]]

## stopwords
stops = stopwords.words("english")
snowstem = SnowballStemmer("english")
portstem = PorterStemmer()

## number of documents
N = 50

## number of prints
n = num_prints

## load csv
csv_path = '/mnt/j/cst2021_2/cord19_midtest_v7.csv'
df = pd.read_csv(csv_path)
df = df.fillna('')

# BM-25 fitting
with open('/mnt/j/cst2021_3/bm25.pickle', 'rb') as fr:
    bm25 = pickle.load(fr)
    
# # ## load tokenizer, models 
tokenizer = AutoTokenizer.from_pretrained("/mnt/j/cst2021/model/")
model = AutoModelForQuestionAnswering.from_pretrained("/mnt/j/cst2021/model/")
model.to('cuda')


# remove punc
def removepunc(my_str):
    punctuations = '''!()-[]{};:'"\,<>./?@#$%^&*_~â'''
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
    
    start_scores = output.start_logits.cpu().numpy()
    end_scores = output.end_logits.cpu().numpy()
    
    n_best_size = 20
    start_indexes = np.argsort(start_scores)[-1 : -n_best_size - 1 : -1].tolist()
    end_indexes = np.argsort(end_scores)[-1 : -n_best_size - 1 : -1].tolist()
    valid_answers = []
    for start_index in start_indexes[0]:
        for end_index in end_indexes[0]:
            if end_index < start_index:
                continue
            if start_index <= end_index: # We need to refine that test to check the answer is inside the context
                valid_answers.append(
                    {
                        "score": start_scores[0][start_index] + end_scores[0][end_index],
                        "idx": slice(start_index,end_index+1)
                    }
                )
                
    if len(valid_answers) > 0:
        best_answer = sorted(valid_answers, key=lambda x: x["score"], reverse=True)[0]
    else:
        best_answer = {"score": 0.0,"idx":slice(0,1)}
    answer = ' '.join(tokens[best_answer['idx']])
    answer = answer.replace(" ##","").replace("[CLS] ","")

    ## for GPU 
    del A,B,output
    torch.cuda.empty_cache()
    pack = [answer,
            best_answer['score'],
            context,
            idx]

    return pack


# answer
def getanswers(question,tokenizer,model,df_):
    processedQuestion =   " ".join([snowstem.stem(i) for i in word_tokenize(removepunc(question)) if i not in stops])
    tokenized_query = processedQuestion.split(" ")
    doc_scores = bm25.get_scores(tokenized_query)
    ques_top_n = np.argsort(doc_scores)[-N:][::-1]
    
    #한 문단 최대 character 수: 
    questions= []
    contexts= []
    idxs = []
    for t in ques_top_n:
        bd = df_.abstract[t]
        stcs = [i for i in sent_tokenize(bd)]   
        idx = 0
        while True:
            buf = stcs[idx]
            if len(buf) < 500:
                while (len(buf) < 500):
                    old_buf = buf
                    idx += 1
                    if idx >= len(stcs):
                        break
                    buf = buf+" "+stcs[idx]
            else:
                old_buf = buf[:len(buf)//2]
                buf = buf[len(buf)//2:]
                contexts.append(buf)
                questions.append(question)
                idxs.append([t])
                idx +=1
            contexts.append(old_buf)
            questions.append(question) 
            idxs.append([t])
            if idx >= len(stcs):
                break

    answers = []
    for  question, context, idx in zip(questions,contexts,idxs):
        result = ask(question,context,idx)
        if len(result[0]) < 7 or "[CLS]" in result[0] :
            continue
        answers.append(result)
    answers = np.array(answers, dtype=object)

    return answers


from IPython.display import display, HTML

mapping = {1:"Systematic review", 2:"Randomized control trial", 3:"Non-randomized trial",
           4:"Prospective observational", 5:"Time-to-event analysis", 6:"Retrospective observational",
           7:"Cross-sectional", 8:"Case series", 9:"Modeling", 0:"Other"}

def highlightTextInContext(ans):
    answer = ans[0]
    score = ans[1]
    context = ans[2]
    idx = ans[3]
    
    title = df.title[idx[0]]
    date = df.date[idx[0]]
    source = df.journal[idx[0]]
    design = mapping[df.design[idx[0]]]
    size = df['size'][idx[0]]
    sample = df['sample'][idx[0]]
    method = df.method[idx[0]]

    if len(sample) > 250:
        sample = sample[:250]+ '...'
    if len(method) > 250:
        method = method[:250]+ '...'
    #     ref = df.reference[idx[0]]
    
    if "?"  in answer:
        answer =" ".join(answer[answer.index("?")+1:].split(" "))
    
    antokens = word_tokenize(answer)
    cotokens = word_tokenize(context)
    startword= ""
    startindex= ""
    for i,w in enumerate(antokens):
        for c in cotokens:
            if c==w and  c!='':
                startword = c 
                selectedText = context[context.index(w):context.index(antokens[-1])+len(antokens[-1])]
                highlighted = f'<span style="color: green; font-weight: bold">{selectedText}</span>'
                fulltext= f'<span style="color: black; font-weight: bold; font-size:18px">{title}<br/></span> \
               <span style="color: black; font-weight: bold"><br>Score: </span>\
               <span style="color: black; font-weight: normal">{score}</span>\
                <span style="color: black; font-weight: bold"><br>Date: </span>\
                <span style="color: black; font-weight: normal">{date}</span>\
                <span style="color: black; font-weight: bold"><br>Source: </span>\
                <span style="color: black; font-weight: normal">{source}</span>\
                <span style="color: black; font-weight: bold"><br>Design: </span>\
                <span style="color: black; font-weight: normal">{design}</span>\
                <span style="color: black; font-weight: bold"><br>Size: </span>\
                <span style="color: black; font-weight: normal">{size}</span>\
                <span style="color: black; font-weight: bold"><br>Sample: </span>\
                <span style="color: black; font-weight: normal">{sample}</span>\
                <span style="color: black; font-weight: bold"><br>Method: </span>\
                <span style="color: black; font-weight: normal">{method}<br></span>\
                <span style="color: black; font-weight: bold">Contents: </span>'+context.replace(selectedText,highlighted)
                return fulltext
                
    return f'<span style="color: black; font-weight: bold; font-size:18px">{title}<br/></span> \
               <span style="color: black; font-weight: bold"><br>Score: </span>\
               <span style="color: black; font-weight: normal">{score}</span>\
                <span style="color: black; font-weight: bold"><br>Date: </span>\
                <span style="color: black; font-weight: normal">{date}</span>\
                <span style="color: black; font-weight: bold"><br>Source: </span>\
                <span style="color: black; font-weight: normal">{source}</span>\
                <span style="color: black; font-weight: bold"><br>Design: </span>\
                <span style="color: black; font-weight: normal">{design}</span>\
                <span style="color: black; font-weight: bold"><br>Size: </span>\
                <span style="color: black; font-weight: normal">{size}</span>\
                <span style="color: black; font-weight: bold"><br>Sample: </span>\
                <span style="color: black; font-weight: normal">{sample}</span>\
                <span style="color: black; font-weight: bold"><br>Method: </span>\
                <span style="color: black; font-weight: normal">{method}<br></span>\
                <span style="color: black; font-weight: bold">Contents: </span>'+context
                # return is an easy way to break two nested loops
       
def showTopAnswers(answers,q,lst):
        lst.append(f'<span style="color: black; font-weight: bold; font-size:20px"> Question: </span><span style="color: red; font-weight: bold; font-size:22px">{q}</span>')
        # display(HTML(f'Question: <span style="color: red; font-weight: bold; font-size:22px">{q}</span>'))
        for i in np.argsort(answers[:,1])[-n:][::-1]:
            # display(HTML(f"<p>=================================================<br>"+highlightTextInContext(answers[i,:])+"</p>"))
            lst.append(f"<p>=================================================<br>"+highlightTextInContext(answers[i,:])+"</p>")
        return lst


# In[ ]:


start = time.perf_counter()
lst =[]
for question in args:
    # display(HTML("<br>"))
    question = f"Is {question} at risk in COVID-19?"
    answers = getanswers(question,stops,snowstem,df)
    lst = showTopAnswers(answers,question,lst)
    # display(HTML("<br><br>"))
print(' '.join(lst))
# print(f"time: {time.perf_counter()-start:.4f}s")

