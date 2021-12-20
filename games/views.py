from django.shortcuts import render, redirect
import pyrebase
import requests
import json
import math


from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.renderers import JSONRenderer

# Create your views here.
config = {
    # ihub reunion
    "apiKey": "AIzaSyBUBV2dWYzeTdn9QnCEJdQ3ieFOE17p95s",
    "authDomain": "ihub-reunion.firebaseapp.com",
    "databaseURL": "https://ihub-reunion-default-rtdb.asia-southeast1.firebasedatabase.app",
    "storageBucket": "ihub-reunion.appspot.com"
}

firebase = pyrebase.initialize_app(config)

def index(request):
    if (request.method == "POST"):
        game_code = request.POST.get("txt_game_code")
        url ="https://ihub-reunion-default-rtdb.asia-southeast1.firebasedatabase.app"
        url += "/games"
        url += ".json?orderBy={}&equalTo=".format('"game_code"')
        url += f'"{game_code}"'
        resp = requests.get(url)
        res=json.loads(resp._content)    
        game_key=list(res.keys())[0]
        return redirect(registerName, game_key)
    return render(request, 'games/index.html')

def registerName(request, game_key):

    if (request.method == "POST"):
        name = request.POST.get("txt_name")
        # save data in google firebase
        db = firebase.database()
        res = db.child("players").push({'game_key':game_key, 'name':name, 'sum_score':0, 'end':False})
        # get uid key from firebase
        uid = res['name']
        return redirect(waitingRoom, game_key, uid)
        
    # url ="https://ihub-reunion-default-rtdb.asia-southeast1.firebasedatabase.app"
    # url += "/games"
    # url += ".json?orderBy={}&equalTo=".format('"game_code"')
    # url += f'"{game_code}"'
    # resp = requests.get(url)
    # res=json.loads(resp._content)    

    url = "https://ihub-reunion-default-rtdb.asia-southeast1.firebasedatabase.app"
    url += "/games/{}.json".format(game_key)
    resp = requests.get(url)
    res=json.loads(resp._content)    

    if len(res) >= 1:
        print(res["status"])
        if res["status"] != "ready":
            context={"error_text": "The game is already start!"}
            return render(request, 'games/ErrorPage.html', context)
        else: 
            context = {"game_key":game_key}
            return render(request, 'games/registerName.html', context)
    else:
        context={"error_text": "No game data?"}
        return render(request, 'games/ErrorPage.html', context)

def endgame(request, game_key):
    context={"list_top":[]}

    url ="https://ihub-reunion-default-rtdb.asia-southeast1.firebasedatabase.app"
    url += "/players"
    url += ".json?orderBy={}&equalTo=".format('"game_key"')
    url += f'"{game_key}"'
    resp = requests.get(url)
    res=json.loads(resp._content)   
    res_dict={}
    for key in list(res.keys()):
        res_dict.update({res[key]["name"]:res[key]["sum_score"]})
    sort_orders = sorted(res_dict.items(), key=lambda x: x[1], reverse=True)

    for item in sort_orders[0:4]:
        # print('{}-{}'.format(item[0], item[1]))
        score = int(item[1])
        context["list_top"].append({"name":item[0], "score":score})



    return render(request, 'games/endgame.html', context=context)

def waitingRoom(request, game_key, uid):
    if (request.method == "POST"):
        question_id=1
        url ="https://ihub-reunion-default-rtdb.asia-southeast1.firebasedatabase.app"
        url += "/games/"+game_key+"/questions"
        url += ".json?orderBy={}&equalTo=".format('"_id"')
        url += str(question_id)
        resp = requests.get(url)
        res=json.loads(resp._content)    
        dict_question=res[list(res.keys())[0]]
        if (dict_question['end'] == True):
            return redirect(endgame, game_key)
        else:
            if (dict_question['status'] != "ready"):
                context={"error_text": "The question is finished"}
                return render(request, 'games/ErrorPage.html', context)
            else:
                return redirect(playGame, game_key, question_id, uid)
    context = {"game_key":game_key, "uid":uid}
    return render(request, 'games/waitingRoom.html', context)

def genChoice(dict_choice):
    list_choice=[]
    for key, value in dict_choice.items():
        list_choice.append({'choice':key, 'text':value})
    return list_choice

def playGame(request, game_key, question_id, uid):

    if (request.method == "POST"):
        next_question_id = request.POST.get("next_question_id")
        print(next_question_id)
        # # next_question_id="2" # get from form
        # gen_question(game_key=game_key, question_id=next_question_id, uid=uid)
        question_id=next_question_id
        url ="https://ihub-reunion-default-rtdb.asia-southeast1.firebasedatabase.app"
        url += "/games/"+game_key+"/questions"
        url += ".json?orderBy={}&equalTo=".format('"_id"')
        url += str(question_id)
        # print(url)
        resp = requests.get(url)
        res=json.loads(resp._content)    
        dict_question=res[list(res.keys())[0]]
        print(dict_question)
        if (dict_question['end'] == True):
            return redirect(endgame, game_key)
        else:
            if (dict_question['status'] != "ready"):
                context={"error_text": "The question is finished"}
                return render(request, 'games/ErrorPage.html', context)
            else:
                return redirect(playGame, game_key, question_id, uid)

    url ="https://ihub-reunion-default-rtdb.asia-southeast1.firebasedatabase.app"
    url += "/games/"+game_key+"/questions"
    url += ".json?orderBy={}&equalTo=".format('"_id"')
    # url += question_id
    url += str(question_id)
    resp = requests.get(url)
    res=json.loads(resp._content)    
    question_key=list(res.keys())[0]
    dict_question=res[question_key]
    context = {
        "game_key":game_key, 
        "question_key":question_key, 
        "uid":uid,
        "text":dict_question['text'],
        "answer":genChoice(dict_question['choices']),
        "next_question_id":dict_question['next_id']
            }
    
    return render(request, 'games/playGame.html', context)



@api_view(['POST'])
@permission_classes((AllowAny,))  # here we specify permission by default we set IsAuthenticated
def submitanswer(request):
    # print('data')
    #data = json.loads(str(request.body, encoding='utf-8'))
    data = request.data
    print(data)
    # check timeout or not
    # if yes -> set count time
    msg=""
    if data['timeout']==True:
        new_score=0
        msg += "ไม่ได้ตอบคำถาม"
    # else -> compare result
    else:
        url ="https://ihub-reunion-default-rtdb.asia-southeast1.firebasedatabase.app"
        url += "/games/"+data['game_key']+"/questions/"+data['question_key']
        url += ".json"
        resp = requests.get(url)
        res=json.loads(resp._content)   
        # check answer is correct or not
        # if not correct -> set count time
        if res['correct'] != data['choice']:
            new_score=0
            msg += "ผิด!"

        # if correct -> set count time
        else:
            countTime=data["countTime"]
            msg += "ถูกต้อง!"

            new_score = 1/math.log10(countTime)*100
    db = firebase.database()
    player = db.child("players/{}/sum_score".format(data['uid'])).get()
    current_score=player.val()
    # update new score
    player = db.child("players/{}".format(data['uid'])).update({'sum_score':current_score+new_score})

    
    msg += " ได้รับ "
    msg += str(new_score)
    msg += " คะแนน"
    return Response(msg)

@api_view(['POST'])
@permission_classes((AllowAny,))  # here we specify permission by default we set IsAuthenticated
def summaryquestion(request):
    data = json.loads(str(request.body, encoding='utf-8'))
    game_key=data['game_key']
    url ="https://ihub-reunion-default-rtdb.asia-southeast1.firebasedatabase.app"
    url += "/players"
    url += ".json?orderBy={}&equalTo=".format('"game_key"')
    url += f'"{game_key}"'
    resp = requests.get(url)
    res=json.loads(resp._content)   
    res_dict={}
    for key in list(res.keys()):
        res_dict.update({res[key]["name"]:res[key]["sum_score"]})
    sort_orders = sorted(res_dict.items(), key=lambda x: x[1], reverse=True)
    msg=""

    for item in sort_orders:
        # print('{}-{}'.format(item[0], item[1]))
        msg += "{}  {} คะแนน".format(item[0],item[1])
        msg += "<br>"

    print(msg)
    return Response(msg)
