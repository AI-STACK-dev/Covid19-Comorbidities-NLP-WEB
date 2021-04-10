#!/home/jsu/Desktop/jsu/jang python
# it's holy moly land!
# ==============================================================================
import argparse
import os
import time
import torch

def test(logger):
    pass

if __name__=='__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('-m','--mode', type=str,default=None,
                        help='mode 선택하셈 : execute/test...')
    parser.add_argument('-a', '--architecture', type=str,  default='Bert',
                        help='모델 선택하셈: Bert/Bert-ft/RoBert....')
    parser.add_argument('-k','--keywords', nargs='*', default=None,
                        help='keywords 넣으셈: age/medical condition ...',required=True)
    args = parser.parse_args()
    mode = args.mode
    arch = args.architecture
    keywords = args.keywords

    print(f'mode: {mode}')
    print(f'architecture: {mode}')
    print(f'keywords: {keywords}')


