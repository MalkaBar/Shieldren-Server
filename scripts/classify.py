#!/usr/bin/python
# -*- coding: utf-8 -*-

#import spacy as sp
#import pandas as pd
import numpy as np
import torch
from torch import nn
from torch.autograd import Variable
import torch.nn.functional as F
from hazm import *
import re
import langid
import string
import pickle
import sys
import threading
import json

def preprocess_line(line):
    lang = langid.classify(str(line))[0]
    if lang == 'he' or lang_id == False:
        # remove URLs
        line = re.sub(r'https?:\/\/[^ ]+', '', line, flags=re.MULTILINE)
        # line = re.sub(r'@[^ ]+', '', line, flags=re.MULTILINE)
        emoji_pattern = re.compile(
            "😀|😁|😂|🤣|😃|😄|😅|😆|😉|😊|😋|😎|😍|😘|😗|😙|😚|☺️|🙂|🤗|🤩|🤔|🤨|😐|😑|😶|🙄|😏|😣|😥|😮|🤐|😯|😪|😫|😴|😌|😛|😜|😝|🤤|😒|😓|😔|😕|🙃|🤑|😲|☹️|🙁|😖|😞|😟|😤|😢|😭|😦|😧|😨|😩|🤯|😬|😰|😱|😳|🤪|😵|😡|😠|🤬|😷|🤒|🤕|🤢|🤮|🤧|😇|🤠|🤡|🤥|🤫|🤭|🧐|🤓|😈|👿|👹|👺|💀|👻|👽|🤖|💩|😺|😸|😹|😻|😼|😽|🙀|😿|😾",
            flags=re.MULTILINE)
        line = emoji_pattern.sub('', line)
        emoji_pattern = re.compile(
            "👶|👦|👧|👨|👩|👴|👵|👨‍⚕️|👩‍⚕️|👨‍🎓|👩‍🎓|👨‍⚖️|👩‍⚖️|👨‍🌾|👩‍🌾|👨‍🍳|👩‍🍳|👨‍🔧|👩‍🔧|👨‍🏭|👩‍🏭|👨‍💼|👩‍💼|👨‍🔬|👩‍🔬|👨‍💻|👩‍💻|👨‍🎤|👩‍🎤|👨‍🎨|👩‍🎨|👨‍✈️|👩‍✈️|👨‍🚀|👩‍🚀|👨‍🚒|👩‍🚒|👮|👮‍♂️|👮‍♀️|🕵|🕵️‍♂️|🕵️‍♀️|💂|💂‍♂️|💂‍♀️|👷|👷‍♂️|👷‍♀️|🤴|👸|👳|👳‍♂️|👳‍♀️|👲|🧕|🧔|👱|👱‍♂️|👱‍♀️|🤵|👰|🤰|🤱|👼|🎅|🤶|🧙‍♀️|🧙‍♂️|🧚‍♀️|🧚‍♂️|🧛‍♀️|🧛‍♂️|🧜‍♀️|🧜‍♂️|🧝‍♀️|🧝‍♂️|🧞‍♀️|🧞‍♂️|🧟‍♀️|🧟‍♂️|🙍|🙍‍♂️|🙍‍♀️|🙎|🙎‍♂️|🙎‍♀️|🙅|🙅‍♂️|🙅‍♀️|🙆|🙆‍♂️|🙆‍♀️|💁|💁‍♂️|💁‍♀️|🙋|🙋‍♂️|🙋‍♀️|🙇|🙇‍♂️|🙇‍♀️|🤦|🤦‍♂️|🤦‍♀️|🤷|🤷‍♂️|🤷‍♀️|💆|💆‍♂️|💆‍♀️|💇|💇‍♂️|💇‍♀️|🚶|🚶‍♂️|🚶‍♀️|🏃|🏃‍♂️|🏃‍♀️|💃|🕺|👯|👯‍♂️|👯‍♀️|🧖‍♀️|🧖‍♂️|🕴|🗣|👤|👥|👫|👬|👭|💏|👨‍❤️‍💋‍👨|👩‍❤️‍💋‍👩|💑|👨‍❤️‍👨|👩‍❤️‍👩|👪|👨‍👩‍👦|👨‍👩‍👧|👨‍👩‍👧‍👦|👨‍👩‍👦‍👦|👨‍👩‍👧‍👧|👨‍👨‍👦|👨‍👨‍👧|👨‍👨‍👧‍👦|👨‍👨‍👦‍👦|👨‍👨‍👧‍👧|👩‍👩‍👦|👩‍👩‍👧|👩‍👩‍👧‍👦|👩‍👩‍👦‍👦|👩‍👩‍👧‍👧|👨‍👦|👨‍👦‍👦|👨‍👧|👨‍👧‍👦|👨‍👧‍👧|👩‍👦|👩‍👦‍👦|👩‍👧|👩‍👧‍👦|👩‍👧‍👧|🤳|💪|👈|👉|☝️|👆|🖕|👇|✌️|🤞|🖖|🤘|🖐|✋|👌|👍|👎|✊|👊|🤛|🤜|🤚|👋|🤟|✍️|👏|👐|🙌|🤲|🙏|🤝|💅|👂|👃|👣|👀|👁|🧠|👅|👄|💋",
            flags=re.MULTILINE)
        line = emoji_pattern.sub('', line)
        emoji_pattern = re.compile(
            "🍃|🌻|🆘|📢|🔆|🌐|📚|🔴|🎄|👠|🔫|🎤|🎤|🎊|🎩|💄|👠|👗|💍|🐱|🐨|🐯|🐹|👗|🔵|🔥|🌝|🕯|🥀|🌷|💟|❤️|💛|💚|💙|💜|🖤|💔|❣️|💕|💞|💓|💗|💖|💘|💝|🌹|🛑|🎷|🎼|🌈|♥️|🎂|🌸🍃|🌺|🌿|🌸|🙈|🍀|🏻|🎉|🎁|🎈|💐|🌺|🌼|🍰",
            flags=re.MULTILINE)
        line = emoji_pattern.sub('', line)

        return line

blacklist = ["RT"]

def process_line(line):
    tokens = word_tokenize(line)
    tokens_clean = []
    for t in tokens:
        if t not in string.punctuation and t not in blacklist:
            tokens_clean.append(t)
    return tokens_clean

class Lang:
    def __init__(self):
        self.vec = []
        self.word_count = 0
        self.ind2word = {}
        self.word2ind = {}
        for line in open("dataset/wiki.he.vec"):
            values = line.split(" ")
            if len(values) == 2:
                continue
            v = []
            for i in range(1, len(values) - 1):
                v.append(float(values[i]))
            self.vec.append(v)
            self.ind2word[self.word_count] = values[0]
            self.word2ind[values[0]] = self.word_count
            self.word_count += 1

try:
    lang = pickle.load('M4x800/lang.checkpoint.8400')
except:
    lang = Lang()

MAX_LENGTH = 140 # Muximum letters in a sentence
MIN_LENGTH = 3 # Minimum words for sentence 

labels = {"neg": 0, "pos": 1}
id2labels = {0: "neg", 1: "pos"}

def sentence2variable(proc_sentence):
    if len(proc_sentence) > MAX_LENGTH:
        return None
    indexes = []
    for t in proc_sentence:
        t = t.encode('utf-8', 'ignore')
        if t in lang.word2ind:  # TODO - Not ignore?
            indexes.append(lang.word2ind[t])
    if len(indexes) < MIN_LENGTH:
        return None
    input_var = Variable(torch.LongTensor(indexes).view(-1, 1))
    return proc_sentence, input_var


# MODULE
class Attn(nn.Module):
    def __init__(self, hidden_size, max_length=MAX_LENGTH):
        super(Attn, self).__init__()

        self.hidden_size = hidden_size
        self.lin = nn.Linear(self.hidden_size * 2, hidden_size * 2)
        self.weight_vec = nn.Parameter(torch.FloatTensor(1, hidden_size * 2))

    def forward(self, outputs):
        seq_len = len(outputs)
        attn_energies = Variable(torch.zeros(seq_len))  # B x 1 x S

        for i in range(seq_len):
            attn_energies[i] = self.score(outputs[i])

        # Normalize energies to weights in range 0 to 1, resize to 1 x 1 x seq_len
        return F.softmax(attn_energies).unsqueeze(0).unsqueeze(0)

    def score(self, output):
        energy = self.lin(output)
        energy = torch.dot(self.weight_vec.view(-1), energy.view(-1))
        return energy


class SentimentModel(nn.Module):
    def __init__(self, lang, hidden_size, output_size, n_layers):
        super(SentimentModel, self).__init__()
        self.hidden_size = hidden_size
        self.output_size = output_size
        self.n_layers = n_layers
        self.embedding = nn.Embedding(lang.word_count, len(lang.vec[0]))
        self.embedding.weight = nn.Parameter(torch.FloatTensor(lang.vec))
        self.embedding.weight.requires_grad = True  # TODO - change to False?

        self.lstm = nn.LSTM(len(lang.vec[0]), hidden_size, n_layers, bidirectional=True)
        self.out = nn.Linear(hidden_size * 2, output_size)
        self.attn = Attn(hidden_size)

    def forward(self, input_text, last_hidden):
        seq_len = len(input_text.data)
        embedded_words = self.embedding(input_text).view(seq_len, 1, -1)
        rnn_outputs, hidden = self.lstm(embedded_words, last_hidden)
        torch.nn.utils.clip_grad_norm(filter(lambda p: p.requires_grad, model.parameters()), 2)

        attn_weights = self.attn(rnn_outputs.squeeze(0))
        # print "attn_weights", attn_weights
        attn_weights = attn_weights.squeeze(1).view(seq_len, 1)
        rnn_outputs = rnn_outputs.squeeze(1)
        attn_weights = attn_weights.expand(seq_len, self.hidden_size * 2)
        weigthed_outputs = torch.mul(rnn_outputs, attn_weights)
        output = torch.sum(weigthed_outputs, -2)
        output = self.out(output)
        # print "output", output
        return output

    def init_hidden(self):
        return (Variable(torch.zeros(self.n_layers * 2, 1, self.hidden_size)),
                Variable(torch.zeros(self.n_layers * 2, 1, self.hidden_size)))

# Decision function
def softmax(x):
    return np.exp(x) / np.sum(np.exp(x), axis=0)

# TODO - Define the Model
n_layers = 4
hidden_size = 800
model = SentimentModel(lang, hidden_size, 2, n_layers)
model.load_state_dict(torch.load("M4x800/model.checkpoint.8400"))


class Classify (threading.Thread):
    def __init__(self, model, sentence, id):
        threading.Thread.__init__(self)
        self.ID = id
        self.model = model
        self.sentence = sentence
        self.classification = -1

    def run(self):
        if (self.sentence == None):
            self.printJson()
        else:
            try:
                sentence = preprocess_line(self.sentence)
                sentence = process_line(sentence.strip().decode('utf-8', errors='ignore'))

                test_var = sentence2variable(sentence)
                hidden = self.model.init_hidden()
                output = self.model(test_var[1], hidden)
                self.classification = np.argmax(softmax(output.data.numpy()))
                self.printJson()
            except:
                self.printJson()

    def printJson(self):
        result = {
            "code": 2,
            "message": "classification result",
            "data": {
                "id": self.ID,
                "sentence": self.sentence,
                "classification": self.classification
            }
        }
        print json.dumps(result)
        sys.stdout.flush()


threads = []
print '{ "code": 1, "message": "End load model. Start waiting for sentences.", "data": null }'

while True:
    stringInput = sys.stdin.readlines()
    if (stringInput == None):
        continue
    else:
        jsonData = json.loads(stringInput)

        if (len(jsonData.sentence) < 2):
            pass
        else:
            thread = Classify(model, jsonData.sentence, jsonData.id)
            thread.start()
            threads.append(thread)