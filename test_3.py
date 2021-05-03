#!/home/jsu/Desktop/jsu/jang python
# it's holy moly land!
# ==============================================================================
import sys
import time
import json

if __name__=='__main__':
    a = sys.stdin.readline()
    # a = eval(a)
    # a = dict(a)
    # print(a['args'][0])
    b = json.loads(a)

    # for i in b:
    #     print(i)
    print(json.dumps(b))
    # print(a.type)
    # time.sleep(2)
    # print("123")
    # print(1)
    # print(sys.argv[1])


