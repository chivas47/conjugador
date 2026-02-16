import { useState, useMemo, useCallback, useRef, useEffect } from "react";

const PRONOUNS = ["eu", "tu", "ele/ela", "nós", "vós", "eles/elas"];

const TENSE_GROUPS = [
  { group: "Indicativo", tenses: ["Presente","Pretérito Perfeito","Pretérito Imperfeito","Pretérito Mais-que-perfeito","Futuro do Presente","Futuro do Pretérito"] },
  { group: "Subjuntivo", tenses: ["Presente do Subjuntivo","Pretérito Imperfeito do Subjuntivo","Futuro do Subjuntivo"] },
  { group: "Imperativo", tenses: ["Imperativo Afirmativo","Imperativo Negativo"] },
  { group: "Formas Nominais", tenses: ["Infinitivo Pessoal","Gerúndio","Particípio"] },
];

const REGULAR_ENDINGS = {
  ar: {
    "Presente": ["o","as","a","amos","ais","am"],
    "Pretérito Perfeito": ["ei","aste","ou","ámos","astes","aram"],
    "Pretérito Imperfeito": ["ava","avas","ava","ávamos","áveis","avam"],
    "Pretérito Mais-que-perfeito": ["ara","aras","ara","áramos","áreis","aram"],
    "Futuro do Presente": ["arei","arás","ará","aremos","areis","arão"],
    "Futuro do Pretérito": ["aria","arias","aria","aríamos","aríeis","ariam"],
    "Presente do Subjuntivo": ["e","es","e","emos","eis","em"],
    "Pretérito Imperfeito do Subjuntivo": ["asse","asses","asse","ássemos","ásseis","assem"],
    "Futuro do Subjuntivo": ["ar","ares","ar","armos","ardes","arem"],
    "Imperativo Afirmativo": ["—","a","e","emos","ai","em"],
    "Imperativo Negativo": ["—","es","e","emos","eis","em"],
    "Infinitivo Pessoal": ["ar","ares","ar","armos","ardes","arem"],
    "Gerúndio": ["ando"], "Particípio": ["ado"],
  },
  er: {
    "Presente": ["o","es","e","emos","eis","em"],
    "Pretérito Perfeito": ["i","este","eu","emos","estes","eram"],
    "Pretérito Imperfeito": ["ia","ias","ia","íamos","íeis","iam"],
    "Pretérito Mais-que-perfeito": ["era","eras","era","êramos","êreis","eram"],
    "Futuro do Presente": ["erei","erás","erá","eremos","ereis","erão"],
    "Futuro do Pretérito": ["eria","erias","eria","eríamos","eríeis","eriam"],
    "Presente do Subjuntivo": ["a","as","a","amos","ais","am"],
    "Pretérito Imperfeito do Subjuntivo": ["esse","esses","esse","êssemos","êsseis","essem"],
    "Futuro do Subjuntivo": ["er","eres","er","ermos","erdes","erem"],
    "Imperativo Afirmativo": ["—","e","a","amos","ei","am"],
    "Imperativo Negativo": ["—","as","a","amos","ais","am"],
    "Infinitivo Pessoal": ["er","eres","er","ermos","erdes","erem"],
    "Gerúndio": ["endo"], "Particípio": ["ido"],
  },
  ir: {
    "Presente": ["o","es","e","imos","is","em"],
    "Pretérito Perfeito": ["i","iste","iu","imos","istes","iram"],
    "Pretérito Imperfeito": ["ia","ias","ia","íamos","íeis","iam"],
    "Pretérito Mais-que-perfeito": ["ira","iras","ira","íramos","íreis","iram"],
    "Futuro do Presente": ["irei","irás","irá","iremos","ireis","irão"],
    "Futuro do Pretérito": ["iria","irias","iria","iríamos","iríeis","iriam"],
    "Presente do Subjuntivo": ["a","as","a","amos","ais","am"],
    "Pretérito Imperfeito do Subjuntivo": ["isse","isses","isse","íssemos","ísseis","issem"],
    "Futuro do Subjuntivo": ["ir","ires","ir","irmos","irdes","irem"],
    "Imperativo Afirmativo": ["—","e","a","amos","i","am"],
    "Imperativo Negativo": ["—","as","a","amos","ais","am"],
    "Infinitivo Pessoal": ["ir","ires","ir","irmos","irdes","irem"],
    "Gerúndio": ["indo"], "Particípio": ["ido"],
  },
};

const IRREGULAR_VERBS = {
  ser: {
    "Presente":["sou","és","é","somos","sois","são"],"Pretérito Perfeito":["fui","foste","foi","fomos","fostes","foram"],
    "Pretérito Imperfeito":["era","eras","era","éramos","éreis","eram"],"Pretérito Mais-que-perfeito":["fora","foras","fora","fôramos","fôreis","foram"],
    "Futuro do Presente":["serei","serás","será","seremos","sereis","serão"],"Futuro do Pretérito":["seria","serias","seria","seríamos","seríeis","seriam"],
    "Presente do Subjuntivo":["seja","sejas","seja","sejamos","sejais","sejam"],"Pretérito Imperfeito do Subjuntivo":["fosse","fosses","fosse","fôssemos","fôsseis","fossem"],
    "Futuro do Subjuntivo":["for","fores","for","formos","fordes","forem"],"Imperativo Afirmativo":["—","sê","seja","sejamos","sede","sejam"],
    "Imperativo Negativo":["—","sejas","seja","sejamos","sejais","sejam"],"Infinitivo Pessoal":["ser","seres","ser","sermos","serdes","serem"],
    "Gerúndio":["sendo"],"Particípio":["sido"],
  },
  estar: {
    "Presente":["estou","estás","está","estamos","estais","estão"],"Pretérito Perfeito":["estive","estiveste","esteve","estivemos","estivestes","estiveram"],
    "Pretérito Imperfeito":["estava","estavas","estava","estávamos","estáveis","estavam"],"Pretérito Mais-que-perfeito":["estivera","estiveras","estivera","estivéramos","estivéreis","estiveram"],
    "Futuro do Presente":["estarei","estarás","estará","estaremos","estareis","estarão"],"Futuro do Pretérito":["estaria","estarias","estaria","estaríamos","estaríeis","estariam"],
    "Presente do Subjuntivo":["esteja","estejas","esteja","estejamos","estejais","estejam"],"Pretérito Imperfeito do Subjuntivo":["estivesse","estivesses","estivesse","estivéssemos","estivésseis","estivessem"],
    "Futuro do Subjuntivo":["estiver","estiveres","estiver","estivermos","estiverdes","estiverem"],"Imperativo Afirmativo":["—","está","esteja","estejamos","estai","estejam"],
    "Imperativo Negativo":["—","estejas","esteja","estejamos","estejais","estejam"],"Infinitivo Pessoal":["estar","estares","estar","estarmos","estardes","estarem"],
    "Gerúndio":["estando"],"Particípio":["estado"],
  },
  ter: {
    "Presente":["tenho","tens","tem","temos","tendes","têm"],"Pretérito Perfeito":["tive","tiveste","teve","tivemos","tivestes","tiveram"],
    "Pretérito Imperfeito":["tinha","tinhas","tinha","tínhamos","tínheis","tinham"],"Pretérito Mais-que-perfeito":["tivera","tiveras","tivera","tivéramos","tivéreis","tiveram"],
    "Futuro do Presente":["terei","terás","terá","teremos","tereis","terão"],"Futuro do Pretérito":["teria","terias","teria","teríamos","teríeis","teriam"],
    "Presente do Subjuntivo":["tenha","tenhas","tenha","tenhamos","tenhais","tenham"],"Pretérito Imperfeito do Subjuntivo":["tivesse","tivesses","tivesse","tivéssemos","tivésseis","tivessem"],
    "Futuro do Subjuntivo":["tiver","tiveres","tiver","tivermos","tiverdes","tiverem"],"Imperativo Afirmativo":["—","tem","tenha","tenhamos","tende","tenham"],
    "Imperativo Negativo":["—","tenhas","tenha","tenhamos","tenhais","tenham"],"Infinitivo Pessoal":["ter","teres","ter","termos","terdes","terem"],
    "Gerúndio":["tendo"],"Particípio":["tido"],
  },
  ir: {
    "Presente":["vou","vais","vai","vamos","ides","vão"],"Pretérito Perfeito":["fui","foste","foi","fomos","fostes","foram"],
    "Pretérito Imperfeito":["ia","ias","ia","íamos","íeis","iam"],"Pretérito Mais-que-perfeito":["fora","foras","fora","fôramos","fôreis","foram"],
    "Futuro do Presente":["irei","irás","irá","iremos","ireis","irão"],"Futuro do Pretérito":["iria","irias","iria","iríamos","iríeis","iriam"],
    "Presente do Subjuntivo":["vá","vás","vá","vamos","vades","vão"],"Pretérito Imperfeito do Subjuntivo":["fosse","fosses","fosse","fôssemos","fôsseis","fossem"],
    "Futuro do Subjuntivo":["for","fores","for","formos","fordes","forem"],"Imperativo Afirmativo":["—","vai","vá","vamos","ide","vão"],
    "Imperativo Negativo":["—","vás","vá","vamos","vades","vão"],"Infinitivo Pessoal":["ir","ires","ir","irmos","irdes","irem"],
    "Gerúndio":["indo"],"Particípio":["ido"],
  },
  fazer: {
    "Presente":["faço","fazes","faz","fazemos","fazeis","fazem"],"Pretérito Perfeito":["fiz","fizeste","fez","fizemos","fizestes","fizeram"],
    "Pretérito Imperfeito":["fazia","fazias","fazia","fazíamos","fazíeis","faziam"],"Pretérito Mais-que-perfeito":["fizera","fizeras","fizera","fizéramos","fizéreis","fizeram"],
    "Futuro do Presente":["farei","farás","fará","faremos","fareis","farão"],"Futuro do Pretérito":["faria","farias","faria","faríamos","faríeis","fariam"],
    "Presente do Subjuntivo":["faça","faças","faça","façamos","façais","façam"],"Pretérito Imperfeito do Subjuntivo":["fizesse","fizesses","fizesse","fizéssemos","fizésseis","fizessem"],
    "Futuro do Subjuntivo":["fizer","fizeres","fizer","fizermos","fizerdes","fizerem"],"Imperativo Afirmativo":["—","faz/faze","faça","façamos","fazei","façam"],
    "Imperativo Negativo":["—","faças","faça","façamos","façais","façam"],"Infinitivo Pessoal":["fazer","fazeres","fazer","fazermos","fazerdes","fazerem"],
    "Gerúndio":["fazendo"],"Particípio":["feito"],
  },
  poder: {
    "Presente":["posso","podes","pode","podemos","podeis","podem"],"Pretérito Perfeito":["pude","pudeste","pôde","pudemos","pudestes","puderam"],
    "Pretérito Imperfeito":["podia","podias","podia","podíamos","podíeis","podiam"],"Pretérito Mais-que-perfeito":["pudera","puderas","pudera","pudéramos","pudéreis","puderam"],
    "Futuro do Presente":["poderei","poderás","poderá","poderemos","podereis","poderão"],"Futuro do Pretérito":["poderia","poderias","poderia","poderíamos","poderíeis","poderiam"],
    "Presente do Subjuntivo":["possa","possas","possa","possamos","possais","possam"],"Pretérito Imperfeito do Subjuntivo":["pudesse","pudesses","pudesse","pudéssemos","pudésseis","pudessem"],
    "Futuro do Subjuntivo":["puder","puderes","puder","pudermos","puderdes","puderem"],
    "Infinitivo Pessoal":["poder","poderes","poder","podermos","poderdes","poderem"],"Gerúndio":["podendo"],"Particípio":["podido"],
  },
  dizer: {
    "Presente":["digo","dizes","diz","dizemos","dizeis","dizem"],"Pretérito Perfeito":["disse","disseste","disse","dissemos","dissestes","disseram"],
    "Pretérito Imperfeito":["dizia","dizias","dizia","dizíamos","dizíeis","diziam"],"Pretérito Mais-que-perfeito":["dissera","disseras","dissera","disséramos","disséreis","disseram"],
    "Futuro do Presente":["direi","dirás","dirá","diremos","direis","dirão"],"Futuro do Pretérito":["diria","dirias","diria","diríamos","diríeis","diriam"],
    "Presente do Subjuntivo":["diga","digas","diga","digamos","digais","digam"],"Pretérito Imperfeito do Subjuntivo":["dissesse","dissesses","dissesse","disséssemos","dissésseis","dissessem"],
    "Futuro do Subjuntivo":["disser","disseres","disser","dissermos","disserdes","disserem"],
    "Infinitivo Pessoal":["dizer","dizeres","dizer","dizermos","dizerdes","dizerem"],"Gerúndio":["dizendo"],"Particípio":["dito"],
  },
  dar: {
    "Presente":["dou","dás","dá","damos","dais","dão"],"Pretérito Perfeito":["dei","deste","deu","demos","destes","deram"],
    "Pretérito Imperfeito":["dava","davas","dava","dávamos","dáveis","davam"],"Pretérito Mais-que-perfeito":["dera","deras","dera","déramos","déreis","deram"],
    "Futuro do Presente":["darei","darás","dará","daremos","dareis","darão"],"Futuro do Pretérito":["daria","darias","daria","daríamos","daríeis","dariam"],
    "Presente do Subjuntivo":["dê","dês","dê","demos","deis","deem"],"Pretérito Imperfeito do Subjuntivo":["desse","desses","desse","déssemos","désseis","dessem"],
    "Futuro do Subjuntivo":["der","deres","der","dermos","derdes","derem"],
    "Imperativo Afirmativo":["—","dá","dê","demos","dai","deem"],"Imperativo Negativo":["—","dês","dê","demos","deis","deem"],
    "Infinitivo Pessoal":["dar","dares","dar","darmos","dardes","darem"],"Gerúndio":["dando"],"Particípio":["dado"],
  },
  saber: {
    "Presente":["sei","sabes","sabe","sabemos","sabeis","sabem"],"Pretérito Perfeito":["soube","soubeste","soube","soubemos","soubestes","souberam"],
    "Pretérito Imperfeito":["sabia","sabias","sabia","sabíamos","sabíeis","sabiam"],"Pretérito Mais-que-perfeito":["soubera","souberas","soubera","soubéramos","soubéreis","souberam"],
    "Futuro do Presente":["saberei","saberás","saberá","saberemos","sabereis","saberão"],"Futuro do Pretérito":["saberia","saberias","saberia","saberíamos","saberíeis","saberiam"],
    "Presente do Subjuntivo":["saiba","saibas","saiba","saibamos","saibais","saibam"],"Pretérito Imperfeito do Subjuntivo":["soubesse","soubesses","soubesse","soubéssemos","soubésseis","soubessem"],
    "Futuro do Subjuntivo":["souber","souberes","souber","soubermos","souberdes","souberem"],
    "Infinitivo Pessoal":["saber","saberes","saber","sabermos","saberdes","saberem"],"Gerúndio":["sabendo"],"Particípio":["sabido"],
  },
  querer: {
    "Presente":["quero","queres","quer","queremos","quereis","querem"],"Pretérito Perfeito":["quis","quiseste","quis","quisemos","quisestes","quiseram"],
    "Pretérito Imperfeito":["queria","querias","queria","queríamos","queríeis","queriam"],"Pretérito Mais-que-perfeito":["quisera","quiseras","quisera","quiséramos","quiséreis","quiseram"],
    "Futuro do Presente":["quererei","quererás","quererá","quereremos","querereis","quererão"],"Futuro do Pretérito":["quereria","quererias","quereria","quereríamos","quereríeis","quereriam"],
    "Presente do Subjuntivo":["queira","queiras","queira","queiramos","queirais","queiram"],"Pretérito Imperfeito do Subjuntivo":["quisesse","quisesses","quisesse","quiséssemos","quisésseis","quisessem"],
    "Futuro do Subjuntivo":["quiser","quiseres","quiser","quisermos","quiserdes","quiserem"],
    "Infinitivo Pessoal":["querer","quereres","querer","querermos","quererdes","quererem"],"Gerúndio":["querendo"],"Particípio":["querido"],
  },
  ver: {
    "Presente":["vejo","vês","vê","vemos","vedes","veem"],"Pretérito Perfeito":["vi","viste","viu","vimos","vistes","viram"],
    "Pretérito Imperfeito":["via","vias","via","víamos","víeis","viam"],"Pretérito Mais-que-perfeito":["vira","viras","vira","víramos","víreis","viram"],
    "Futuro do Presente":["verei","verás","verá","veremos","vereis","verão"],"Futuro do Pretérito":["veria","verias","veria","veríamos","veríeis","veriam"],
    "Presente do Subjuntivo":["veja","vejas","veja","vejamos","vejais","vejam"],"Pretérito Imperfeito do Subjuntivo":["visse","visses","visse","víssemos","vísseis","vissem"],
    "Futuro do Subjuntivo":["vir","vires","vir","virmos","virdes","virem"],
    "Infinitivo Pessoal":["ver","veres","ver","vermos","verdes","verem"],"Gerúndio":["vendo"],"Particípio":["visto"],
  },
  vir: {
    "Presente":["venho","vens","vem","vimos","vindes","vêm"],"Pretérito Perfeito":["vim","vieste","veio","viemos","viestes","vieram"],
    "Pretérito Imperfeito":["vinha","vinhas","vinha","vínhamos","vínheis","vinham"],"Pretérito Mais-que-perfeito":["viera","vieras","viera","viéramos","viéreis","vieram"],
    "Futuro do Presente":["virei","virás","virá","viremos","vireis","virão"],"Futuro do Pretérito":["viria","virias","viria","viríamos","viríeis","viriam"],
    "Presente do Subjuntivo":["venha","venhas","venha","venhamos","venhais","venham"],"Pretérito Imperfeito do Subjuntivo":["viesse","viesses","viesse","viéssemos","viésseis","viessem"],
    "Futuro do Subjuntivo":["vier","vieres","vier","viermos","vierdes","vierem"],
    "Infinitivo Pessoal":["vir","vires","vir","virmos","virdes","virem"],"Gerúndio":["vindo"],"Particípio":["vindo"],
  },
  "pôr": {
    "Presente":["ponho","pões","põe","pomos","pondes","põem"],"Pretérito Perfeito":["pus","puseste","pôs","pusemos","pusestes","puseram"],
    "Pretérito Imperfeito":["punha","punhas","punha","púnhamos","púnheis","punham"],"Pretérito Mais-que-perfeito":["pusera","puseras","pusera","puséramos","puséreis","puseram"],
    "Futuro do Presente":["porei","porás","porá","poremos","poreis","porão"],"Futuro do Pretérito":["poria","porias","poria","poríamos","poríeis","poriam"],
    "Presente do Subjuntivo":["ponha","ponhas","ponha","ponhamos","ponhais","ponham"],"Pretérito Imperfeito do Subjuntivo":["pusesse","pusesses","pusesse","puséssemos","pusésseis","pusessem"],
    "Futuro do Subjuntivo":["puser","puseres","puser","pusermos","puserdes","puserem"],
    "Imperativo Afirmativo":["—","põe","ponha","ponhamos","ponde","ponham"],"Imperativo Negativo":["—","ponhas","ponha","ponhamos","ponhais","ponham"],
    "Infinitivo Pessoal":["pôr","pores","pôr","pormos","pordes","porem"],"Gerúndio":["pondo"],"Particípio":["posto"],
  },
  haver: {
    "Presente":["hei","hás","há","havemos","haveis","hão"],"Pretérito Perfeito":["houve","houveste","houve","houvemos","houvestes","houveram"],
    "Pretérito Imperfeito":["havia","havias","havia","havíamos","havíeis","haviam"],"Pretérito Mais-que-perfeito":["houvera","houveras","houvera","houvéramos","houvéreis","houveram"],
    "Futuro do Presente":["haverei","haverás","haverá","haveremos","havereis","haverão"],"Futuro do Pretérito":["haveria","haverias","haveria","haveríamos","haveríeis","haveriam"],
    "Presente do Subjuntivo":["haja","hajas","haja","hajamos","hajais","hajam"],"Pretérito Imperfeito do Subjuntivo":["houvesse","houvesses","houvesse","houvéssemos","houvésseis","houvessem"],
    "Futuro do Subjuntivo":["houver","houveres","houver","houvermos","houverdes","houverem"],
    "Infinitivo Pessoal":["haver","haveres","haver","havermos","haverdes","haverem"],"Gerúndio":["havendo"],"Particípio":["havido"],
  },
  trazer: {
    "Presente":["trago","trazes","traz","trazemos","trazeis","trazem"],"Pretérito Perfeito":["trouxe","trouxeste","trouxe","trouxemos","trouxestes","trouxeram"],
    "Pretérito Imperfeito":["trazia","trazias","trazia","trazíamos","trazíeis","traziam"],"Pretérito Mais-que-perfeito":["trouxera","trouxeras","trouxera","trouxéramos","trouxéreis","trouxeram"],
    "Futuro do Presente":["trarei","trarás","trará","traremos","trareis","trarão"],"Futuro do Pretérito":["traria","trarias","traria","traríamos","traríeis","trariam"],
    "Presente do Subjuntivo":["traga","tragas","traga","tragamos","tragais","tragam"],"Pretérito Imperfeito do Subjuntivo":["trouxesse","trouxesses","trouxesse","trouxéssemos","trouxésseis","trouxessem"],
    "Futuro do Subjuntivo":["trouxer","trouxeres","trouxer","trouxermos","trouxerdes","trouxerem"],
    "Infinitivo Pessoal":["trazer","trazeres","trazer","trazermos","trazerdes","trazerem"],"Gerúndio":["trazendo"],"Particípio":["trazido"],
  },
  ler: {
    "Presente":["leio","lês","lê","lemos","ledes","leem"],"Pretérito Perfeito":["li","leste","leu","lemos","lestes","leram"],
    "Presente do Subjuntivo":["leia","leias","leia","leiamos","leiais","leiam"],
    "Gerúndio":["lendo"],"Particípio":["lido"],
  },
  pedir: {
    "Presente":["peço","pedes","pede","pedimos","pedis","pedem"],
    "Presente do Subjuntivo":["peça","peças","peça","peçamos","peçais","peçam"],
    "Gerúndio":["pedindo"],"Particípio":["pedido"],
  },
  ouvir: {
    "Presente":["ouço","ouves","ouve","ouvimos","ouvis","ouvem"],
    "Presente do Subjuntivo":["ouça","ouças","ouça","ouçamos","ouçais","ouçam"],
    "Gerúndio":["ouvindo"],"Particípio":["ouvido"],
  },
  dormir: {
    "Presente":["durmo","dormes","dorme","dormimos","dormis","dormem"],
    "Presente do Subjuntivo":["durma","durmas","durma","durmamos","durmais","durmam"],
    "Gerúndio":["dormindo"],"Particípio":["dormido"],
  },
  caber: {
    "Presente":["caibo","cabes","cabe","cabemos","cabeis","cabem"],
    "Pretérito Perfeito":["coube","coubeste","coube","coubemos","coubestes","couberam"],
    "Presente do Subjuntivo":["caiba","caibas","caiba","caibamos","caibais","caibam"],
    "Pretérito Imperfeito do Subjuntivo":["coubesse","coubesses","coubesse","coubéssemos","coubésseis","coubessem"],
    "Futuro do Subjuntivo":["couber","couberes","couber","coubermos","couberdes","couberem"],
    "Gerúndio":["cabendo"],"Particípio":["cabido"],
  },
  escrever: { "Particípio":["escrito"] },
  abrir: { "Particípio":["aberto"] },
  cobrir: {
    "Presente":["cubro","cobres","cobre","cobrimos","cobris","cobrem"],
    "Presente do Subjuntivo":["cubra","cubras","cubra","cubramos","cubrais","cubram"],
    "Particípio":["coberto"],
  },
  // Derived from ter
  manter: {
    "Presente":["mantenho","manténs","mantém","mantemos","mantendes","mantêm"],
    "Pretérito Perfeito":["mantive","mantiveste","manteve","mantivemos","mantivestes","mantiveram"],
    "Pretérito Imperfeito":["mantinha","mantinhas","mantinha","mantínhamos","mantínheis","mantinham"],
    "Presente do Subjuntivo":["mantenha","mantenhas","mantenha","mantenhamos","mantenhais","mantenham"],
    "Pretérito Imperfeito do Subjuntivo":["mantivesse","mantivesses","mantivesse","mantivéssemos","mantivésseis","mantivessem"],
    "Futuro do Subjuntivo":["mantiver","mantiveres","mantiver","mantivermos","mantiverdes","mantiverem"],
    "Gerúndio":["mantendo"],"Particípio":["mantido"],
  },
  conter: {
    "Presente":["contenho","conténs","contém","contemos","contendes","contêm"],
    "Pretérito Perfeito":["contive","contiveste","conteve","contivemos","contivestes","contiveram"],
    "Presente do Subjuntivo":["contenha","contenhas","contenha","contenhamos","contenhais","contenham"],
    "Pretérito Imperfeito do Subjuntivo":["contivesse","contivesses","contivesse","contivéssemos","contivésseis","contivessem"],
    "Futuro do Subjuntivo":["contiver","contiveres","contiver","contivermos","contiverdes","contiverem"],
    "Gerúndio":["contendo"],"Particípio":["contido"],
  },
  deter: {
    "Presente":["detenho","deténs","detém","detemos","detendes","detêm"],
    "Pretérito Perfeito":["detive","detiveste","deteve","detivemos","detivestes","detiveram"],
    "Presente do Subjuntivo":["detenha","detenhas","detenha","detenhamos","detenhais","detenham"],
    "Pretérito Imperfeito do Subjuntivo":["detivesse","detivesses","detivesse","detivéssemos","detivésseis","detivessem"],
    "Futuro do Subjuntivo":["detiver","detiveres","detiver","detivermos","detiverdes","detiverem"],
    "Gerúndio":["detendo"],"Particípio":["detido"],
  },
  obter: {
    "Presente":["obtenho","obténs","obtém","obtemos","obtendes","obtêm"],
    "Pretérito Perfeito":["obtive","obtiveste","obteve","obtivemos","obtivestes","obtiveram"],
    "Presente do Subjuntivo":["obtenha","obtenhas","obtenha","obtenhamos","obtenhais","obtenham"],
    "Pretérito Imperfeito do Subjuntivo":["obtivesse","obtivesses","obtivesse","obtivéssemos","obtivésseis","obtivessem"],
    "Futuro do Subjuntivo":["obtiver","obtiveres","obtiver","obtivermos","obtiverdes","obtiverem"],
    "Gerúndio":["obtendo"],"Particípio":["obtido"],
  },
  reter: {
    "Presente":["retenho","reténs","retém","retemos","retendes","retêm"],
    "Pretérito Perfeito":["retive","retiveste","reteve","retivemos","retivestes","retiveram"],
    "Presente do Subjuntivo":["retenha","retenhas","retenha","retenhamos","retenhais","retenham"],
    "Gerúndio":["retendo"],"Particípio":["retido"],
  },
  // Derived from vir
  convir: {
    "Presente":["convenho","convéns","convém","convimos","convindes","convêm"],
    "Pretérito Perfeito":["convim","convieste","conveio","conviemos","conviestes","convieram"],
    "Presente do Subjuntivo":["convenha","convenhas","convenha","convenhamos","convenhais","convenham"],
    "Gerúndio":["convindo"],"Particípio":["convindo"],
  },
  intervir: {
    "Presente":["intervenho","intervéns","intervém","intervimos","intervindes","intervêm"],
    "Pretérito Perfeito":["intervim","intervieste","interveio","interviemos","interviestes","intervieram"],
    "Presente do Subjuntivo":["intervenha","intervenhas","intervenha","intervenhamos","intervenhais","intervenham"],
    "Gerúndio":["intervindo"],"Particípio":["intervindo"],
  },
  provir: {
    "Presente":["provenho","provéns","provém","provimos","provindes","provêm"],
    "Pretérito Perfeito":["provim","provieste","proveio","proviemos","proviestes","provieram"],
    "Gerúndio":["provindo"],"Particípio":["provindo"],
  },
  // Derived from pôr
  compor: {
    "Presente":["componho","compões","compõe","compomos","compondes","compõem"],
    "Pretérito Perfeito":["compus","compuseste","compôs","compusemos","compusestes","compuseram"],
    "Presente do Subjuntivo":["componha","componhas","componha","componhamos","componhais","componham"],
    "Pretérito Imperfeito do Subjuntivo":["compusesse","compusesses","compusesse","compuséssemos","compusésseis","compusessem"],
    "Futuro do Subjuntivo":["compuser","compuseres","compuser","compusermos","compuserdes","compuserem"],
    "Gerúndio":["compondo"],"Particípio":["composto"],
  },
  dispor: {
    "Presente":["disponho","dispões","dispõe","dispomos","dispondes","dispõem"],
    "Pretérito Perfeito":["dispus","dispuseste","dispôs","dispusemos","dispusestes","dispuseram"],
    "Presente do Subjuntivo":["disponha","disponhas","disponha","disponhamos","disponhais","disponham"],
    "Gerúndio":["dispondo"],"Particípio":["disposto"],
  },
  expor: {
    "Presente":["exponho","expões","expõe","expomos","expondes","expõem"],
    "Pretérito Perfeito":["expus","expuseste","expôs","expusemos","expusestes","expuseram"],
    "Presente do Subjuntivo":["exponha","exponhas","exponha","exponhamos","exponhais","exponham"],
    "Gerúndio":["expondo"],"Particípio":["exposto"],
  },
  impor: {
    "Presente":["imponho","impões","impõe","impomos","impondes","impõem"],
    "Pretérito Perfeito":["impus","impuseste","impôs","impusemos","impusestes","impuseram"],
    "Presente do Subjuntivo":["imponha","imponhas","imponha","imponhamos","imponhais","imponham"],
    "Gerúndio":["impondo"],"Particípio":["imposto"],
  },
  opor: {
    "Presente":["oponho","opões","opõe","opomos","opondes","opõem"],
    "Pretérito Perfeito":["opus","opuseste","opôs","opusemos","opusestes","opuseram"],
    "Presente do Subjuntivo":["oponha","oponhas","oponha","oponhamos","oponhais","oponham"],
    "Gerúndio":["opondo"],"Particípio":["oposto"],
  },
  propor: {
    "Presente":["proponho","propões","propõe","propomos","propondes","propõem"],
    "Pretérito Perfeito":["propus","propuseste","propôs","propusemos","propusestes","propuseram"],
    "Presente do Subjuntivo":["proponha","proponhas","proponha","proponhamos","proponhais","proponham"],
    "Gerúndio":["propondo"],"Particípio":["proposto"],
  },
  supor: {
    "Presente":["suponho","supões","supõe","supomos","supondes","supõem"],
    "Pretérito Perfeito":["supus","supuseste","supôs","supusemos","supusestes","supuseram"],
    "Presente do Subjuntivo":["suponha","suponhas","suponha","suponhamos","suponhais","suponham"],
    "Gerúndio":["supondo"],"Particípio":["suposto"],
  },
  depor: {
    "Presente":["deponho","depões","depõe","depomos","depondes","depõem"],
    "Pretérito Perfeito":["depus","depuseste","depôs","depusemos","depusestes","depuseram"],
    "Presente do Subjuntivo":["deponha","deponhas","deponha","deponhamos","deponhais","deponham"],
    "Gerúndio":["depondo"],"Particípio":["deposto"],
  },
  // Derived from ver
  prever: {
    "Presente":["prevejo","prevês","prevê","prevemos","prevedes","preveem"],
    "Pretérito Perfeito":["previ","previste","previu","previmos","previstes","previram"],
    "Presente do Subjuntivo":["preveja","prevejas","preveja","prevejamos","prevejais","prevejam"],
    "Gerúndio":["prevendo"],"Particípio":["previsto"],
  },
  rever: {
    "Presente":["revejo","revês","revê","revemos","revedes","reveem"],
    "Pretérito Perfeito":["revi","reviste","reviu","revimos","revistes","reviram"],
    "Presente do Subjuntivo":["reveja","revejas","reveja","revejamos","revejais","revejam"],
    "Gerúndio":["revendo"],"Particípio":["revisto"],
  },
  // Derived from fazer
  satisfazer: {
    "Presente":["satisfaço","satisfazes","satisfaz","satisfazemos","satisfazeis","satisfazem"],
    "Pretérito Perfeito":["satisfiz","satisfizeste","satisfez","satisfizemos","satisfizestes","satisfizeram"],
    "Presente do Subjuntivo":["satisfaça","satisfaças","satisfaça","satisfaçamos","satisfaçais","satisfaçam"],
    "Futuro do Presente":["satisfarei","satisfarás","satisfará","satisfaremos","satisfareis","satisfarão"],
    "Gerúndio":["satisfazendo"],"Particípio":["satisfeito"],
  },
  desfazer: {
    "Presente":["desfaço","desfazes","desfaz","desfazemos","desfazeis","desfazem"],
    "Pretérito Perfeito":["desfiz","desfizeste","desfez","desfizemos","desfizestes","desfizeram"],
    "Presente do Subjuntivo":["desfaça","desfaças","desfaça","desfaçamos","desfaçais","desfaçam"],
    "Gerúndio":["desfazendo"],"Particípio":["desfeito"],
  },
  // Other key irregulars
  cair: {
    "Presente":["caio","cais","cai","caímos","caís","caem"],
    "Pretérito Perfeito":["caí","caíste","caiu","caímos","caístes","caíram"],
    "Presente do Subjuntivo":["caia","caias","caia","caiamos","caiais","caiam"],
    "Gerúndio":["caindo"],"Particípio":["caído"],
  },
  sair: {
    "Presente":["saio","sais","sai","saímos","saís","saem"],
    "Pretérito Perfeito":["saí","saíste","saiu","saímos","saístes","saíram"],
    "Presente do Subjuntivo":["saia","saias","saia","saiamos","saiais","saiam"],
    "Gerúndio":["saindo"],"Particípio":["saído"],
  },
  rir: {
    "Presente":["rio","ris","ri","rimos","rides","riem"],
    "Pretérito Perfeito":["ri","riste","riu","rimos","ristes","riram"],
    "Presente do Subjuntivo":["ria","rias","ria","riamos","riais","riam"],
    "Gerúndio":["rindo"],"Particípio":["rido"],
  },
  valer: {
    "Presente":["valho","vales","vale","valemos","valeis","valem"],
    "Presente do Subjuntivo":["valha","valhas","valha","valhamos","valhais","valham"],
    "Gerúndio":["valendo"],"Particípio":["valido"],
  },
  medir: {
    "Presente":["meço","medes","mede","medimos","medis","medem"],
    "Presente do Subjuntivo":["meça","meças","meça","meçamos","meçais","meçam"],
    "Gerúndio":["medindo"],"Particípio":["medido"],
  },
  adquirir: {
    "Presente":["adquiro","adquires","adquire","adquirimos","adquiris","adquirem"],
    "Presente do Subjuntivo":["adquira","adquiras","adquira","adquiramos","adquirais","adquiram"],
    "Gerúndio":["adquirindo"],"Particípio":["adquirido"],
  },
  trair: {
    "Presente":["traio","trais","trai","traímos","traís","traem"],
    "Pretérito Perfeito":["traí","traíste","traiu","traímos","traístes","traíram"],
    "Presente do Subjuntivo":["traia","traias","traia","traiamos","traiais","traiam"],
    "Gerúndio":["traindo"],"Particípio":["traído"],
  },
  crer: {
    "Presente":["creio","crês","crê","cremos","credes","creem"],
    "Pretérito Perfeito":["cri","creste","creu","cremos","crestes","creram"],
    "Presente do Subjuntivo":["creia","creias","creia","creiamos","creiais","creiam"],
    "Gerúndio":["crendo"],"Particípio":["crido"],
  },

};

const VERB_LIST = [
{verb:"abalar",meaning:"to shake",type:"regular"},
  {verb:"abanar",meaning:"to fan",type:"regular"},
  {verb:"abandonar",meaning:"to abandon",type:"regular"},
  {verb:"abater",meaning:"to shoot down",type:"regular"},
  {verb:"abordar",meaning:"to approach",type:"regular"},
  {verb:"aborrecer",meaning:"to annoy",type:"regular"},
  {verb:"abranger",meaning:"to include",type:"regular"},
  {verb:"abraçar",meaning:"to hug",type:"regular"},
  {verb:"abrigar",meaning:"to shelter",type:"regular"},
  {verb:"abrir",meaning:"to open",type:"irregular"},
  {verb:"absorver",meaning:"to absorb",type:"regular"},
  {verb:"acabar",meaning:"to finish",type:"regular"},
  {verb:"acalmar",meaning:"to calm down",type:"regular"},
  {verb:"acarretar",meaning:"to entail",type:"regular"},
  {verb:"accionar",meaning:"to trigger",type:"regular"},
  {verb:"aceitar",meaning:"to accept",type:"regular"},
  {verb:"acelerar",meaning:"to speed up",type:"regular"},
  {verb:"acenar",meaning:"to wave",type:"regular"},
  {verb:"acender",meaning:"to light up",type:"regular"},
  {verb:"acentuar",meaning:"to accentuate",type:"regular"},
  {verb:"acertar",meaning:"to hit",type:"regular"},
  {verb:"achar",meaning:"to think",type:"regular"},
  {verb:"acolher",meaning:"to welcome",type:"regular"},
  {verb:"acompanhar",meaning:"to accompany",type:"regular"},
  {verb:"aconselhar",meaning:"to advise",type:"regular"},
  {verb:"acontecer",meaning:"to happen",type:"regular"},
  {verb:"acordar",meaning:"to wake up",type:"regular"},
  {verb:"acreditar",meaning:"to believe",type:"regular"},
  {verb:"acrescentar",meaning:"to add",type:"regular"},
  {verb:"actualizar",meaning:"to update",type:"regular"},
  {verb:"actuar",meaning:"to act",type:"regular"},
  {verb:"acudir",meaning:"to help",type:"regular"},
  {verb:"acumular",meaning:"to accumulate",type:"regular"},
  {verb:"acusar",meaning:"to accuse",type:"regular"},
  {verb:"adaptar",meaning:"to adapt",type:"regular"},
  {verb:"aderir",meaning:"to join",type:"regular"},
  {verb:"adiantar",meaning:"to advance",type:"regular"},
  {verb:"adiar",meaning:"to postpone",type:"regular"},
  {verb:"adivinhar",meaning:"to guess",type:"regular"},
  {verb:"administrar",meaning:"to manage",type:"regular"},
  {verb:"admirar",meaning:"to admire",type:"regular"},
  {verb:"admitir",meaning:"to admit",type:"regular"},
  {verb:"adoptar",meaning:"to adopt",type:"regular"},
  {verb:"adorar",meaning:"to worship",type:"regular"},
  {verb:"adormecer",meaning:"to fall sleep",type:"regular"},
  {verb:"adquirir",meaning:"to purchase",type:"irregular"},
  {verb:"advertir",meaning:"to warn",type:"regular"},
  {verb:"afastar",meaning:"to move away",type:"regular"},
  {verb:"afectar",meaning:"to affect",type:"regular"},
  {verb:"afirmar",meaning:"to claim",type:"regular"},
  {verb:"afogar",meaning:"to swamp",type:"regular"},
  {verb:"afundar",meaning:"to sink",type:"regular"},
  {verb:"agarrar",meaning:"to grab",type:"regular"},
  {verb:"agir",meaning:"to act",type:"regular"},
  {verb:"agitar",meaning:"to shake",type:"regular"},
  {verb:"agradar",meaning:"to please",type:"regular"},
  {verb:"agradecer",meaning:"to thank",type:"regular"},
  {verb:"agravar",meaning:"to aggravate",type:"regular"},
  {verb:"agredir",meaning:"to assault",type:"regular"},
  {verb:"agrupar",meaning:"to agroup",type:"regular"},
  {verb:"aguardar",meaning:"to wait",type:"regular"},
  {verb:"aguentar",meaning:"to hold on",type:"regular"},
  {verb:"ajudar",meaning:"to help",type:"regular"},
  {verb:"ajustar",meaning:"to adjust",type:"regular"},
  {verb:"alargar",meaning:"to extend",type:"regular"},
  {verb:"alastrar",meaning:"to sprawl",type:"regular"},
  {verb:"alcançar",meaning:"to reach",type:"regular"},
  {verb:"alegar",meaning:"to claim",type:"regular"},
  {verb:"alertar",meaning:"to alert",type:"regular"},
  {verb:"alimentar",meaning:"to feed",type:"regular"},
  {verb:"aliviar",meaning:"to relieve",type:"regular"},
  {verb:"almoçar",meaning:"to have lunch",type:"regular"},
  {verb:"alongar",meaning:"to stretches",type:"regular"},
  {verb:"alterar",meaning:"to alter",type:"regular"},
  {verb:"alugar",meaning:"to hire",type:"regular"},
  {verb:"amanhecer",meaning:"to dawn",type:"regular"},
  {verb:"amar",meaning:"to love",type:"regular"},
  {verb:"ameaçar",meaning:"to threaten",type:"regular"},
  {verb:"ampliar",meaning:"to enlarge",type:"regular"},
  {verb:"analisar",meaning:"to analyze",type:"regular"},
  {verb:"andar",meaning:"to walk",type:"regular"},
  {verb:"animar",meaning:"to animate",type:"regular"},
  {verb:"anteceder",meaning:"to precede",type:"regular"},
  {verb:"antecipar",meaning:"to anticipate",type:"regular"},
  {verb:"anular",meaning:"to cancel",type:"regular"},
  {verb:"anunciar",meaning:"to announce",type:"regular"},
  {verb:"apagar",meaning:"to switch off",type:"regular"},
  {verb:"apaixonar",meaning:"to fall in love",type:"regular"},
  {verb:"apanhar",meaning:"to take",type:"regular"},
  {verb:"aparecer",meaning:"to appear",type:"regular"},
  {verb:"apelar",meaning:"to appeal",type:"regular"},
  {verb:"apertar",meaning:"to tighten",type:"regular"},
  {verb:"apetecer",meaning:"to feel like",type:"regular"},
  {verb:"aplicar",meaning:"to apply",type:"regular"},
  {verb:"apoiar",meaning:"to support",type:"regular"},
  {verb:"apontar",meaning:"to point",type:"regular"},
  {verb:"apostar",meaning:"to bet",type:"regular"},
  {verb:"apreciar",meaning:"to appreciate",type:"regular"},
  {verb:"aprender",meaning:"to learn",type:"regular"},
  {verb:"apresentar",meaning:"to present",type:"regular"},
  {verb:"apressar",meaning:"to rush",type:"regular"},
  {verb:"aprofundar",meaning:"to deepen",type:"regular"},
  {verb:"aprovar",meaning:"to approve",type:"regular"},
  {verb:"aproveitar",meaning:"to enjoy",type:"regular"},
  {verb:"aproximar",meaning:"to approach",type:"regular"},
  {verb:"apurar",meaning:"to investigate",type:"regular"},
  {verb:"aquecer",meaning:"to warm",type:"regular"},
  {verb:"arder",meaning:"to burn",type:"regular"},
  {verb:"argumentar",meaning:"to argue",type:"regular"},
  {verb:"armar",meaning:"to arm",type:"regular"},
  {verb:"armazenar",meaning:"to store",type:"regular"},
  {verb:"arrancar",meaning:"to rip out",type:"regular"},
  {verb:"arranjar",meaning:"to arrange",type:"regular"},
  {verb:"arrastar",meaning:"to drag",type:"regular"},
  {verb:"arrecadar",meaning:"to collect",type:"regular"},
  {verb:"arrepender",meaning:"to repent",type:"regular"},
  {verb:"arriscar",meaning:"to risk",type:"regular"},
  {verb:"arrumar",meaning:"to arrange",type:"regular"},
  {verb:"articular",meaning:"to articulate",type:"regular"},
  {verb:"ascender",meaning:"to ascend",type:"regular"},
  {verb:"assegurar",meaning:"to secure",type:"regular"},
  {verb:"assemelhar",meaning:"to resemble",type:"regular"},
  {verb:"assentar",meaning:"to settle",type:"regular"},
  {verb:"assinalar",meaning:"to tick",type:"regular"},
  {verb:"assinar",meaning:"to sign",type:"regular"},
  {verb:"assistir",meaning:"to attend",type:"regular"},
  {verb:"associar",meaning:"to connect",type:"regular"},
  {verb:"assumir",meaning:"to assume",type:"regular"},
  {verb:"assustar",meaning:"to scare",type:"regular"},
  {verb:"atacar",meaning:"to attack",type:"regular"},
  {verb:"atar",meaning:"to tie",type:"regular"},
  {verb:"atender",meaning:"to meet",type:"regular"},
  {verb:"atingir",meaning:"to achieve",type:"regular"},
  {verb:"atirar",meaning:"to shoot",type:"regular"},
  {verb:"atrair",meaning:"to attract",type:"irregular"},
  {verb:"atrapalhar",meaning:"to disturb",type:"regular"},
  {verb:"atrasar",meaning:"to delay",type:"regular"},
  {verb:"atravessar",meaning:"to pass through",type:"regular"},
  {verb:"atrever",meaning:"to dare",type:"regular"},
  {verb:"atribuir",meaning:"to assign",type:"regular"},
  {verb:"aumentar",meaning:"to increase",type:"regular"},
  {verb:"autorizar",meaning:"to authorize",type:"regular"},
  {verb:"auxiliar",meaning:"to assistant",type:"regular"},
  {verb:"avaliar",meaning:"to assess",type:"regular"},
  {verb:"avançar",meaning:"to advance",type:"regular"},
  {verb:"avisar",meaning:"to warn",type:"regular"},
  {verb:"avistar",meaning:"to catch sight of",type:"regular"},
  {verb:"baixar",meaning:"to go down",type:"regular"},
  {verb:"balançar",meaning:"to swing",type:"regular"},
  {verb:"balbuciar",meaning:"to babble",type:"regular"},
  {verb:"banhar",meaning:"to bathe",type:"regular"},
  {verb:"baptizar",meaning:"to baptize",type:"regular"},
  {verb:"basear",meaning:"to base",type:"regular"},
  {verb:"bastar",meaning:"to suffice",type:"regular"},
  {verb:"bater",meaning:"to knock",type:"regular"},
  {verb:"beber",meaning:"to drink",type:"regular"},
  {verb:"beijar",meaning:"to kiss",type:"regular"},
  {verb:"beneficiar",meaning:"to benefit",type:"regular"},
  {verb:"berrar",meaning:"to scream",type:"regular"},
  {verb:"botar",meaning:"to put",type:"regular"},
  {verb:"bradar",meaning:"to shout",type:"regular"},
  {verb:"brigar",meaning:"to fight",type:"regular"},
  {verb:"brilhar",meaning:"to shine",type:"regular"},
  {verb:"brincar",meaning:"to play",type:"regular"},
  {verb:"buscar",meaning:"to search",type:"regular"},
  {verb:"caber",meaning:"to fit",type:"irregular"},
  {verb:"cair",meaning:"to fall",type:"irregular"},
  {verb:"calar",meaning:"to shut up",type:"regular"},
  {verb:"calcular",meaning:"to calculate",type:"regular"},
  {verb:"calhar",meaning:"to handy",type:"regular"},
  {verb:"caminhar",meaning:"to walk",type:"regular"},
  {verb:"cancelar",meaning:"to cancel",type:"regular"},
  {verb:"candidatar",meaning:"to apply",type:"regular"},
  {verb:"cansar",meaning:"to tire",type:"regular"},
  {verb:"cantar",meaning:"to sing",type:"regular"},
  {verb:"captar",meaning:"to capture",type:"regular"},
  {verb:"capturar",meaning:"to capture",type:"regular"},
  {verb:"caracterizar",meaning:"to characterize",type:"regular"},
  {verb:"carregar",meaning:"to load",type:"regular"},
  {verb:"casar",meaning:"to marry",type:"regular"},
  {verb:"cascar",meaning:"to bark",type:"regular"},
  {verb:"causar",meaning:"to cause",type:"regular"},
  {verb:"caçar",meaning:"to hunt",type:"regular"},
  {verb:"ceder",meaning:"to give way",type:"regular"},
  {verb:"celebrar",meaning:"to celebrate",type:"regular"},
  {verb:"centrar",meaning:"to center",type:"regular"},
  {verb:"cercar",meaning:"to surround",type:"regular"},
  {verb:"cerrar",meaning:"to close",type:"regular"},
  {verb:"cessar",meaning:"to cease",type:"regular"},
  {verb:"chamar",meaning:"to call",type:"regular"},
  {verb:"chefiar",meaning:"to head",type:"regular"},
  {verb:"chegar",meaning:"to arrive",type:"regular"},
  {verb:"cheirar",meaning:"to smell",type:"regular"},
  {verb:"chocar",meaning:"to hatch",type:"regular"},
  {verb:"chorar",meaning:"to cry",type:"regular"},
  {verb:"chover",meaning:"to rain",type:"regular"},
  {verb:"circular",meaning:"to circular",type:"regular"},
  {verb:"citar",meaning:"to quote",type:"regular"},
  {verb:"clamar",meaning:"to cry out",type:"regular"},
  {verb:"classificar",meaning:"to rank",type:"regular"},
  {verb:"cobrar",meaning:"to demand",type:"regular"},
  {verb:"cobrir",meaning:"to cover",type:"irregular"},
  {verb:"coincidir",meaning:"to match",type:"regular"},
  {verb:"colaborar",meaning:"to collaborate",type:"regular"},
  {verb:"colar",meaning:"to paste",type:"regular"},
  {verb:"colher",meaning:"to harvest",type:"regular"},
  {verb:"colocar",meaning:"to place",type:"regular"},
  {verb:"comandar",meaning:"to command",type:"regular"},
  {verb:"combater",meaning:"to fight",type:"regular"},
  {verb:"combinar",meaning:"to combine",type:"regular"},
  {verb:"comemorar",meaning:"to celebrate",type:"regular"},
  {verb:"comentar",meaning:"to comment",type:"regular"},
  {verb:"comer",meaning:"to eat",type:"regular"},
  {verb:"cometer",meaning:"to commit",type:"regular"},
  {verb:"começar",meaning:"to start",type:"regular"},
  {verb:"comparar",meaning:"to compare",type:"regular"},
  {verb:"comparecer",meaning:"to attend",type:"regular"},
  {verb:"compensar",meaning:"to compensate",type:"regular"},
  {verb:"competir",meaning:"to compete",type:"regular"},
  {verb:"completar",meaning:"to complete",type:"regular"},
  {verb:"complicar",meaning:"to complicate",type:"regular"},
  {verb:"compor",meaning:"to compose",type:"irregular"},
  {verb:"comportar",meaning:"to behave",type:"regular"},
  {verb:"comprar",meaning:"to purchase",type:"regular"},
  {verb:"compreender",meaning:"to understand",type:"regular"},
  {verb:"comprometer",meaning:"to compromise",type:"regular"},
  {verb:"comprovar",meaning:"to prove",type:"regular"},
  {verb:"comunicar",meaning:"to communicate",type:"regular"},
  {verb:"conceber",meaning:"to conceive",type:"regular"},
  {verb:"conceder",meaning:"to grant",type:"regular"},
  {verb:"concentrar",meaning:"to concentrate",type:"regular"},
  {verb:"concluir",meaning:"to conclude",type:"regular"},
  {verb:"concordar",meaning:"to agree",type:"regular"},
  {verb:"concorrer",meaning:"to compete",type:"regular"},
  {verb:"concretizar",meaning:"to concretize",type:"regular"},
  {verb:"condenar",meaning:"to condemn",type:"regular"},
  {verb:"conduzir",meaning:"to drive",type:"regular"},
  {verb:"conferir",meaning:"to check",type:"regular"},
  {verb:"confessar",meaning:"to confess",type:"regular"},
  {verb:"confiar",meaning:"to trust",type:"regular"},
  {verb:"confirmar",meaning:"to confirm",type:"regular"},
  {verb:"conformar",meaning:"to conform",type:"regular"},
  {verb:"confundir",meaning:"to confuse",type:"regular"},
  {verb:"conhecer",meaning:"to know",type:"regular"},
  {verb:"conquistar",meaning:"to conquer",type:"regular"},
  {verb:"consagrar",meaning:"to consecrate",type:"regular"},
  {verb:"conseguir",meaning:"to get",type:"regular"},
  {verb:"consentir",meaning:"to consent",type:"regular"},
  {verb:"conservar",meaning:"to conserve",type:"regular"},
  {verb:"considerar",meaning:"to consider",type:"regular"},
  {verb:"consistir",meaning:"to consist",type:"regular"},
  {verb:"consolidar",meaning:"to consolidate",type:"regular"},
  {verb:"constar",meaning:"to record",type:"regular"},
  {verb:"constatar",meaning:"to verify",type:"regular"},
  {verb:"constituir",meaning:"to constitute",type:"regular"},
  {verb:"construir",meaning:"to ramp up",type:"regular"},
  {verb:"consultar",meaning:"to consult",type:"regular"},
  {verb:"consumir",meaning:"to consume",type:"regular"},
  {verb:"contactar",meaning:"to contact",type:"regular"},
  {verb:"contar",meaning:"to tell",type:"regular"},
  {verb:"contemplar",meaning:"to contemplate",type:"regular"},
  {verb:"conter",meaning:"to contain",type:"irregular"},
  {verb:"contestar",meaning:"to contest",type:"regular"},
  {verb:"continuar",meaning:"to continue",type:"regular"},
  {verb:"contrair",meaning:"to contract",type:"irregular"},
  {verb:"contrariar",meaning:"to counteract",type:"regular"},
  {verb:"contratar",meaning:"to hire",type:"regular"},
  {verb:"contribuir",meaning:"to contribute",type:"regular"},
  {verb:"controlar",meaning:"to control",type:"regular"},
  {verb:"convencer",meaning:"to convince",type:"regular"},
  {verb:"conversar",meaning:"to talk",type:"regular"},
  {verb:"converter",meaning:"to convert",type:"regular"},
  {verb:"convidar",meaning:"to invite",type:"regular"},
  {verb:"convir",meaning:"to suit",type:"irregular"},
  {verb:"conviver",meaning:"to coexist",type:"regular"},
  {verb:"convocar",meaning:"to summon up",type:"regular"},
  {verb:"coordenar",meaning:"to coordinate",type:"regular"},
  {verb:"copiar",meaning:"to copy",type:"regular"},
  {verb:"correr",meaning:"to run",type:"regular"},
  {verb:"corresponder",meaning:"to match",type:"regular"},
  {verb:"corrigir",meaning:"to correct",type:"regular"},
  {verb:"cortar",meaning:"to cut",type:"regular"},
  {verb:"costumar",meaning:"to get used to",type:"regular"},
  {verb:"coçar",meaning:"to scratch",type:"regular"},
  {verb:"crer",meaning:"to believe",type:"irregular"},
  {verb:"crescer",meaning:"to grow",type:"regular"},
  {verb:"criar",meaning:"to create",type:"regular"},
  {verb:"criticar",meaning:"to criticize",type:"regular"},
  {verb:"cruzar",meaning:"to cross",type:"regular"},
  {verb:"cuidar",meaning:"to care",type:"regular"},
  {verb:"culminar",meaning:"to culminate",type:"regular"},
  {verb:"culpar",meaning:"to blame",type:"regular"},
  {verb:"cultivar",meaning:"to grow crops",type:"regular"},
  {verb:"cumprimentar",meaning:"to greet",type:"regular"},
  {verb:"cumprir",meaning:"to fulfill",type:"regular"},
  {verb:"curar",meaning:"to heal",type:"regular"},
  {verb:"curvar",meaning:"to bend over",type:"regular"},
  {verb:"custar",meaning:"to cost",type:"regular"},
  {verb:"dançar",meaning:"to dance",type:"regular"},
  {verb:"dar",meaning:"to give",type:"irregular"},
  {verb:"debater",meaning:"to debate",type:"regular"},
  {verb:"debruçar",meaning:"to lean over",type:"regular"},
  {verb:"decidir",meaning:"to decide",type:"regular"},
  {verb:"declarar",meaning:"to declare",type:"regular"},
  {verb:"decorar",meaning:"to decorate",type:"regular"},
  {verb:"decorrer",meaning:"to elapse",type:"regular"},
  {verb:"decretar",meaning:"to enact",type:"regular"},
  {verb:"dedicar",meaning:"to dedicate",type:"regular"},
  {verb:"defender",meaning:"to defend",type:"regular"},
  {verb:"definir",meaning:"to define",type:"regular"},
  {verb:"defrontar",meaning:"to face",type:"regular"},
  {verb:"deitar",meaning:"to lie down",type:"regular"},
  {verb:"deixar",meaning:"to leave",type:"regular"},
  {verb:"demitir",meaning:"to dismiss",type:"regular"},
  {verb:"demonstrar",meaning:"to demonstrate",type:"regular"},
  {verb:"demorar",meaning:"to take time",type:"regular"},
  {verb:"denominar",meaning:"to denominate",type:"regular"},
  {verb:"denunciar",meaning:"to denounce",type:"regular"},
  {verb:"deparar",meaning:"to came across",type:"regular"},
  {verb:"depender",meaning:"to depend",type:"regular"},
  {verb:"depor",meaning:"to depose",type:"irregular"},
  {verb:"depositar",meaning:"to deposit",type:"regular"},
  {verb:"derivar",meaning:"to derive",type:"regular"},
  {verb:"derramar",meaning:"to pour",type:"regular"},
  {verb:"derrotar",meaning:"to defeat",type:"regular"},
  {verb:"derrubar",meaning:"to tear down",type:"regular"},
  {verb:"desabafar",meaning:"to blurt out",type:"regular"},
  {verb:"desafiar",meaning:"to challenge",type:"regular"},
  {verb:"desaparecer",meaning:"to vanish",type:"regular"},
  {verb:"descansar",meaning:"to rest",type:"regular"},
  {verb:"descartar",meaning:"to discard",type:"regular"},
  {verb:"descer",meaning:"to descend",type:"regular"},
  {verb:"descobrir",meaning:"to discover",type:"regular"},
  {verb:"desconfiar",meaning:"to suspect",type:"regular"},
  {verb:"desconhecer",meaning:"to unaware",type:"regular"},
  {verb:"descrever",meaning:"to describe",type:"regular"},
  {verb:"desculpar",meaning:"to apologize",type:"regular"},
  {verb:"desejar",meaning:"to wish",type:"regular"},
  {verb:"desembarcar",meaning:"to land",type:"regular"},
  {verb:"desempenhar",meaning:"to perform",type:"regular"},
  {verb:"desencadear",meaning:"to initiate",type:"regular"},
  {verb:"desenhar",meaning:"to design",type:"regular"},
  {verb:"desenrolar",meaning:"to unroll",type:"regular"},
  {verb:"desenvolver",meaning:"to develop",type:"regular"},
  {verb:"desfazer",meaning:"to undo",type:"irregular"},
  {verb:"designar",meaning:"to designate",type:"regular"},
  {verb:"desistir",meaning:"to give up",type:"regular"},
  {verb:"desligar",meaning:"to switch off",type:"regular"},
  {verb:"deslizar",meaning:"to slide",type:"regular"},
  {verb:"deslocar",meaning:"to move",type:"regular"},
  {verb:"desmentir",meaning:"to disprove",type:"regular"},
  {verb:"despedir",meaning:"to dismiss",type:"regular"},
  {verb:"despertar",meaning:"to awakening",type:"regular"},
  {verb:"desprezar",meaning:"to despise",type:"regular"},
  {verb:"destacar",meaning:"to highlight",type:"regular"},
  {verb:"destinar",meaning:"to allocate",type:"regular"},
  {verb:"destruir",meaning:"to destroy",type:"regular"},
  {verb:"desviar",meaning:"to dodge",type:"regular"},
  {verb:"detectar",meaning:"to detect",type:"regular"},
  {verb:"deter",meaning:"to detain",type:"irregular"},
  {verb:"determinar",meaning:"to determine",type:"regular"},
  {verb:"detestar",meaning:"to detest",type:"regular"},
  {verb:"dever",meaning:"to duty",type:"regular"},
  {verb:"devolver",meaning:"to give back",type:"regular"},
  {verb:"devorar",meaning:"to devour",type:"regular"},
  {verb:"diferenciar",meaning:"to differentiate",type:"regular"},
  {verb:"diferir",meaning:"to differ",type:"regular"},
  {verb:"dificultar",meaning:"to hinder",type:"regular"},
  {verb:"diminuir",meaning:"to decrease",type:"regular"},
  {verb:"dirigir",meaning:"to drive",type:"regular"},
  {verb:"disciplinar",meaning:"to disciplinary",type:"regular"},
  {verb:"discutir",meaning:"to discuss",type:"regular"},
  {verb:"disfarçar",meaning:"to disguise",type:"regular"},
  {verb:"disparar",meaning:"to shoot",type:"regular"},
  {verb:"dispensar",meaning:"to dismiss",type:"regular"},
  {verb:"dispersar",meaning:"to disperse",type:"regular"},
  {verb:"disponibilizar",meaning:"to make available",type:"regular"},
  {verb:"dispor",meaning:"to dispose",type:"irregular"},
  {verb:"disputar",meaning:"to dispute",type:"regular"},
  {verb:"dissolver",meaning:"to dissolve",type:"regular"},
  {verb:"distinguir",meaning:"to distinguish",type:"regular"},
  {verb:"distrair",meaning:"to distract",type:"irregular"},
  {verb:"distribuir",meaning:"to distribute",type:"regular"},
  {verb:"ditar",meaning:"to dictate",type:"regular"},
  {verb:"divertir",meaning:"to amuse",type:"regular"},
  {verb:"dividir",meaning:"to divide",type:"regular"},
  {verb:"divulgar",meaning:"to disclose",type:"regular"},
  {verb:"dizer",meaning:"to say",type:"irregular"},
  {verb:"doar",meaning:"to donate",type:"regular"},
  {verb:"dobrar",meaning:"to bend",type:"regular"},
  {verb:"doer",meaning:"to hurt",type:"regular"},
  {verb:"dominar",meaning:"to master",type:"regular"},
  {verb:"dormir",meaning:"to sleep",type:"irregular"},
  {verb:"dotar",meaning:"to endow",type:"regular"},
  {verb:"durar",meaning:"to last",type:"regular"},
  {verb:"duvidar",meaning:"to doubt",type:"regular"},
  {verb:"edificar",meaning:"to build",type:"regular"},
  {verb:"editar",meaning:"to edit",type:"regular"},
  {verb:"efectuar",meaning:"to carry out",type:"regular"},
  {verb:"elaborar",meaning:"to elaborate",type:"regular"},
  {verb:"eleger",meaning:"to elect",type:"regular"},
  {verb:"elevar",meaning:"to elevate",type:"regular"},
  {verb:"eliminar",meaning:"to eliminate",type:"regular"},
  {verb:"elogiar",meaning:"to praise",type:"regular"},
  {verb:"embarcar",meaning:"to board",type:"regular"},
  {verb:"emergir",meaning:"to emerge",type:"irregular"},
  {verb:"emigrar",meaning:"to emigrate",type:"regular"},
  {verb:"emitir",meaning:"to issue",type:"regular"},
  {verb:"empatar",meaning:"to tie",type:"regular"},
  {verb:"empenhar",meaning:"to pledge",type:"regular"},
  {verb:"empreender",meaning:"to undertake",type:"regular"},
  {verb:"empregar",meaning:"to employ",type:"regular"},
  {verb:"emprestar",meaning:"to loan",type:"regular"},
  {verb:"empurrar",meaning:"to push",type:"regular"},
  {verb:"encaminhar",meaning:"to forward",type:"regular"},
  {verb:"encarar",meaning:"to stare",type:"regular"},
  {verb:"encarregar",meaning:"to charge",type:"regular"},
  {verb:"encerrar",meaning:"to close",type:"regular"},
  {verb:"encher",meaning:"to fill",type:"regular"},
  {verb:"encolher",meaning:"to shrink",type:"regular"},
  {verb:"encomendar",meaning:"to order",type:"regular"},
  {verb:"encontrar",meaning:"to meet",type:"regular"},
  {verb:"encostar",meaning:"to pull over",type:"regular"},
  {verb:"enfatizar",meaning:"to emphasize",type:"regular"},
  {verb:"enfiar",meaning:"to stick",type:"regular"},
  {verb:"enfrentar",meaning:"to face",type:"regular"},
  {verb:"enganar",meaning:"to deceive",type:"regular"},
  {verb:"englobar",meaning:"to encompass",type:"regular"},
  {verb:"engolir",meaning:"to swallow",type:"regular"},
  {verb:"enriquecer",meaning:"to enrich",type:"regular"},
  {verb:"enrolar",meaning:"to curl",type:"regular"},
  {verb:"ensaiar",meaning:"to rehearse",type:"regular"},
  {verb:"ensinar",meaning:"to teach",type:"regular"},
  {verb:"entender",meaning:"to understand",type:"regular"},
  {verb:"enterrar",meaning:"to bury",type:"regular"},
  {verb:"entrar",meaning:"to enter",type:"regular"},
  {verb:"entregar",meaning:"to deliver",type:"regular"},
  {verb:"envelhecer",meaning:"to age",type:"regular"},
  {verb:"enviar",meaning:"to send",type:"regular"},
  {verb:"envolver",meaning:"to involve",type:"regular"},
  {verb:"enxergar",meaning:"to see",type:"regular"},
  {verb:"enxugar",meaning:"to dry",type:"regular"},
  {verb:"equivaler",meaning:"to equate",type:"regular"},
  {verb:"erguer",meaning:"to lift",type:"regular"},
  {verb:"errar",meaning:"to err",type:"regular"},
  {verb:"escalar",meaning:"to climb",type:"regular"},
  {verb:"escapar",meaning:"to escape",type:"regular"},
  {verb:"esclarecer",meaning:"to clarify",type:"regular"},
  {verb:"escolher",meaning:"to choose",type:"regular"},
  {verb:"esconder",meaning:"to hide",type:"regular"},
  {verb:"escorregar",meaning:"to slip",type:"regular"},
  {verb:"escorrer",meaning:"to drip",type:"regular"},
  {verb:"escrever",meaning:"to write",type:"irregular"},
  {verb:"escutar",meaning:"to listen",type:"regular"},
  {verb:"esforçar",meaning:"to strive",type:"regular"},
  {verb:"esfregar",meaning:"to scrub",type:"regular"},
  {verb:"esgotar",meaning:"to exhaust",type:"regular"},
  {verb:"esmagar",meaning:"to smash",type:"regular"},
  {verb:"espalhar",meaning:"to spread",type:"regular"},
  {verb:"espantar",meaning:"to scare away",type:"regular"},
  {verb:"especificar",meaning:"to specify",type:"regular"},
  {verb:"esperar",meaning:"to wait",type:"regular"},
  {verb:"espiar",meaning:"to spy",type:"regular"},
  {verb:"espreitar",meaning:"to peek",type:"regular"},
  {verb:"esquecer",meaning:"to forget",type:"regular"},
  {verb:"estabelecer",meaning:"to establish",type:"regular"},
  {verb:"estacionar",meaning:"to park",type:"regular"},
  {verb:"estalar",meaning:"to snap",type:"regular"},
  {verb:"estar",meaning:"to be",type:"irregular"},
  {verb:"estender",meaning:"to extend",type:"regular"},
  {verb:"estimar",meaning:"to estimate",type:"regular"},
  {verb:"estimular",meaning:"to encourage",type:"regular"},
  {verb:"estragar",meaning:"to spoil",type:"regular"},
  {verb:"estranhar",meaning:"to wonder",type:"regular"},
  {verb:"estrear",meaning:"to premier",type:"regular"},
  {verb:"estremecer",meaning:"to shudder",type:"regular"},
  {verb:"estudar",meaning:"to study",type:"regular"},
  {verb:"evidenciar",meaning:"to evidence",type:"regular"},
  {verb:"evitar",meaning:"to avoid",type:"regular"},
  {verb:"evocar",meaning:"to evoke",type:"regular"},
  {verb:"evoluir",meaning:"to evolve",type:"regular"},
  {verb:"examinar",meaning:"to examine",type:"regular"},
  {verb:"exceder",meaning:"to exceed",type:"regular"},
  {verb:"exclamar",meaning:"to exclaim",type:"regular"},
  {verb:"excluir",meaning:"to delete",type:"regular"},
  {verb:"executar",meaning:"to execute",type:"regular"},
  {verb:"exercer",meaning:"to exercise",type:"regular"},
  {verb:"exibir",meaning:"to display",type:"regular"},
  {verb:"exigir",meaning:"to demand",type:"regular"},
  {verb:"existir",meaning:"to exist",type:"regular"},
  {verb:"expandir",meaning:"to expand",type:"regular"},
  {verb:"experimentar",meaning:"to experiment",type:"regular"},
  {verb:"explicar",meaning:"to explain",type:"regular"},
  {verb:"explodir",meaning:"to explode",type:"regular"},
  {verb:"explorar",meaning:"to explore",type:"regular"},
  {verb:"expor",meaning:"to expose",type:"irregular"},
  {verb:"exportar",meaning:"to export",type:"regular"},
  {verb:"expressar",meaning:"to express",type:"regular"},
  {verb:"exprimir",meaning:"to express",type:"regular"},
  {verb:"expulsar",meaning:"to kick out",type:"regular"},
  {verb:"extinguir",meaning:"to extinguish",type:"regular"},
  {verb:"extrair",meaning:"to extract",type:"irregular"},
  {verb:"fabricar",meaning:"to manufacture",type:"regular"},
  {verb:"facilitar",meaning:"to facilitate",type:"regular"},
  {verb:"falar",meaning:"to speak",type:"regular"},
  {verb:"falecer",meaning:"to die",type:"regular"},
  {verb:"falhar",meaning:"to fail",type:"regular"},
  {verb:"faltar",meaning:"to miss",type:"regular"},
  {verb:"fartar",meaning:"to satiate",type:"regular"},
  {verb:"favorecer",meaning:"to favor",type:"regular"},
  {verb:"fazer",meaning:"to do",type:"irregular"},
  {verb:"fechar",meaning:"to close",type:"regular"},
  {verb:"ferir",meaning:"to hurt",type:"regular"},
  {verb:"ferver",meaning:"to boil",type:"regular"},
  {verb:"fiar",meaning:"to spin",type:"regular"},
  {verb:"ficar",meaning:"to stay",type:"regular"},
  {verb:"figurar",meaning:"to figure",type:"regular"},
  {verb:"filmar",meaning:"to film",type:"regular"},
  {verb:"finalizar",meaning:"to finalize",type:"regular"},
  {verb:"financiar",meaning:"to finance",type:"regular"},
  {verb:"findar",meaning:"to end",type:"regular"},
  {verb:"fingir",meaning:"to fake",type:"regular"},
  {verb:"firmar",meaning:"to firm",type:"regular"},
  {verb:"fiscalizar",meaning:"to inspect",type:"regular"},
  {verb:"fitar",meaning:"to stare",type:"regular"},
  {verb:"fixar",meaning:"to fix",type:"regular"},
  {verb:"florescer",meaning:"to bloom",type:"regular"},
  {verb:"fluir",meaning:"to flow",type:"regular"},
  {verb:"flutuar",meaning:"to float",type:"regular"},
  {verb:"formar",meaning:"to form",type:"regular"},
  {verb:"formular",meaning:"to formulate",type:"regular"},
  {verb:"fornecer",meaning:"to supply",type:"regular"},
  {verb:"fortalecer",meaning:"to strengthen",type:"regular"},
  {verb:"forçar",meaning:"to force",type:"regular"},
  {verb:"fotografar",meaning:"to photograph",type:"regular"},
  {verb:"frequentar",meaning:"to attend",type:"regular"},
  {verb:"frisar",meaning:"to crimp",type:"regular"},
  {verb:"fugir",meaning:"to escape",type:"regular"},
  {verb:"fumar",meaning:"to smoke",type:"regular"},
  {verb:"funcionar",meaning:"to work",type:"regular"},
  {verb:"fundar",meaning:"to found",type:"regular"},
  {verb:"fundir",meaning:"to merge",type:"regular"},
  {verb:"furar",meaning:"to pierce",type:"regular"},
  {verb:"ganhar",meaning:"to win",type:"regular"},
  {verb:"garantir",meaning:"to guarantee",type:"regular"},
  {verb:"gastar",meaning:"to spend",type:"regular"},
  {verb:"gemer",meaning:"to moan",type:"regular"},
  {verb:"gerar",meaning:"to generate",type:"regular"},
  {verb:"gerir",meaning:"to manage",type:"regular"},
  {verb:"girar",meaning:"to spin",type:"regular"},
  {verb:"gostar",meaning:"to like",type:"regular"},
  {verb:"governar",meaning:"to rule",type:"regular"},
  {verb:"gozar",meaning:"to enjoy",type:"regular"},
  {verb:"gravar",meaning:"to record",type:"regular"},
  {verb:"gritar",meaning:"to shout out",type:"regular"},
  {verb:"guardar",meaning:"to save",type:"regular"},
  {verb:"guiar",meaning:"to guide",type:"regular"},
  {verb:"habitar",meaning:"to dwell",type:"regular"},
  {verb:"habituar",meaning:"to accustom",type:"regular"},
  {verb:"haver",meaning:"to be",type:"irregular"},
  {verb:"herdar",meaning:"to inherit",type:"regular"},
  {verb:"hesitar",meaning:"to hesitate",type:"regular"},
  {verb:"homenagear",meaning:"to honor",type:"regular"},
  {verb:"identificar",meaning:"to identify",type:"regular"},
  {verb:"ignorar",meaning:"to ignore",type:"regular"},
  {verb:"iluminar",meaning:"to illuminate",type:"regular"},
  {verb:"ilustrar",meaning:"to illustrate",type:"regular"},
  {verb:"imaginar",meaning:"to imagine",type:"regular"},
  {verb:"imitar",meaning:"to imitate",type:"regular"},
  {verb:"impedir",meaning:"to prevent",type:"regular"},
  {verb:"implantar",meaning:"to deploy",type:"regular"},
  {verb:"implementar",meaning:"to implement",type:"regular"},
  {verb:"implicar",meaning:"to imply",type:"regular"},
  {verb:"impor",meaning:"to impose",type:"irregular"},
  {verb:"importar",meaning:"to import",type:"regular"},
  {verb:"impressionar",meaning:"to impress",type:"regular"},
  {verb:"imprimir",meaning:"to print out",type:"regular"},
  {verb:"improvisar",meaning:"to improvise",type:"regular"},
  {verb:"inaugurar",meaning:"to inaugurate",type:"regular"},
  {verb:"incentivar",meaning:"to encourage",type:"regular"},
  {verb:"incidir",meaning:"to focus",type:"regular"},
  {verb:"inclinar",meaning:"to lean",type:"regular"},
  {verb:"incluir",meaning:"to include",type:"regular"},
  {verb:"incomodar",meaning:"to disturb",type:"regular"},
  {verb:"incorporar",meaning:"to incorporate",type:"regular"},
  {verb:"indagar",meaning:"to inquire",type:"regular"},
  {verb:"indicar",meaning:"to indicate",type:"regular"},
  {verb:"induzir",meaning:"to induce",type:"regular"},
  {verb:"influenciar",meaning:"to influence",type:"regular"},
  {verb:"informar",meaning:"to inform",type:"regular"},
  {verb:"ingressar",meaning:"to join",type:"regular"},
  {verb:"iniciar",meaning:"to start",type:"regular"},
  {verb:"inserir",meaning:"to insert",type:"regular"},
  {verb:"insistir",meaning:"to insist",type:"regular"},
  {verb:"inspirar",meaning:"to inspire",type:"regular"},
  {verb:"instalar",meaning:"to install",type:"regular"},
  {verb:"instituir",meaning:"to institute",type:"regular"},
  {verb:"integrar",meaning:"to integrate",type:"regular"},
  {verb:"intensificar",meaning:"to intensify",type:"regular"},
  {verb:"interessar",meaning:"to interest",type:"regular"},
  {verb:"interferir",meaning:"to interfere",type:"regular"},
  {verb:"interpretar",meaning:"to interpret",type:"regular"},
  {verb:"interrogar",meaning:"to interrogate",type:"regular"},
  {verb:"interromper",meaning:"to interrupt",type:"regular"},
  {verb:"intervir",meaning:"to intervene",type:"irregular"},
  {verb:"introduzir",meaning:"to introduce",type:"regular"},
  {verb:"invadir",meaning:"to break into",type:"regular"},
  {verb:"inventar",meaning:"to invent",type:"regular"},
  {verb:"inverter",meaning:"to reverse",type:"regular"},
  {verb:"investigar",meaning:"to investigate",type:"regular"},
  {verb:"investir",meaning:"to invest",type:"regular"},
  {verb:"invocar",meaning:"to summon up",type:"regular"},
  {verb:"ir",meaning:"to go",type:"irregular"},
  {verb:"irar",meaning:"to anger",type:"regular"},
  {verb:"irritar",meaning:"to irritate",type:"regular"},
  {verb:"isolar",meaning:"to isolate",type:"regular"},
  {verb:"jantar",meaning:"to have lunch",type:"regular"},
  {verb:"jazer",meaning:"to lie",type:"irregular"},
  {verb:"jogar",meaning:"to play",type:"regular"},
  {verb:"julgar",meaning:"to judge",type:"regular"},
  {verb:"juntar",meaning:"to bring together",type:"regular"},
  {verb:"jurar",meaning:"to swear",type:"regular"},
  {verb:"justificar",meaning:"to justify",type:"regular"},
  {verb:"lamentar",meaning:"to lament",type:"regular"},
  {verb:"lançar",meaning:"to throw",type:"regular"},
  {verb:"largar",meaning:"to drop",type:"regular"},
  {verb:"lavar",meaning:"to wash",type:"regular"},
  {verb:"leccionar",meaning:"to teach",type:"regular"},
  {verb:"lembrar",meaning:"to remember",type:"regular"},
  {verb:"ler",meaning:"to read",type:"irregular"},
  {verb:"levantar",meaning:"to rise",type:"regular"},
  {verb:"levar",meaning:"to take",type:"regular"},
  {verb:"liberar",meaning:"to release",type:"regular"},
  {verb:"libertar",meaning:"to release",type:"regular"},
  {verb:"licenciar",meaning:"to license",type:"regular"},
  {verb:"lidar",meaning:"to lead",type:"regular"},
  {verb:"liderar",meaning:"to lead",type:"regular"},
  {verb:"ligar",meaning:"to connect",type:"regular"},
  {verb:"limitar",meaning:"to limit",type:"regular"},
  {verb:"limpar",meaning:"to clean",type:"regular"},
  {verb:"livrar",meaning:"to rid",type:"regular"},
  {verb:"localizar",meaning:"to locate",type:"regular"},
  {verb:"lutar",meaning:"to fight",type:"regular"},
  {verb:"mandar",meaning:"to send",type:"regular"},
  {verb:"manifestar",meaning:"to manifest",type:"regular"},
  {verb:"manter",meaning:"to maintain",type:"irregular"},
  {verb:"marcar",meaning:"to mark",type:"regular"},
  {verb:"marchar",meaning:"to march",type:"regular"},
  {verb:"matar",meaning:"to kill",type:"regular"},
  {verb:"medir",meaning:"to measure",type:"irregular"},
  {verb:"meditar",meaning:"to meditate",type:"regular"},
  {verb:"melhorar",meaning:"to improve",type:"regular"},
  {verb:"mencionar",meaning:"to mention",type:"regular"},
  {verb:"mentir",meaning:"to lie",type:"regular"},
  {verb:"merecer",meaning:"to deserve",type:"regular"},
  {verb:"mergulhar",meaning:"to dive",type:"regular"},
  {verb:"meter",meaning:"to putto in",type:"regular"},
  {verb:"mexer",meaning:"to mix",type:"regular"},
  {verb:"misturar",meaning:"to mix",type:"regular"},
  {verb:"mobilizar",meaning:"to mobilize",type:"regular"},
  {verb:"modificar",meaning:"to modify",type:"regular"},
  {verb:"moer",meaning:"to grind",type:"regular"},
  {verb:"montar",meaning:"to assemble",type:"regular"},
  {verb:"morar",meaning:"to live",type:"regular"},
  {verb:"morder",meaning:"to bite",type:"regular"},
  {verb:"morrer",meaning:"to die",type:"regular"},
  {verb:"mostrar",meaning:"to show",type:"regular"},
  {verb:"motivar",meaning:"to motivate",type:"regular"},
  {verb:"mover",meaning:"to move",type:"regular"},
  {verb:"movimentar",meaning:"to move",type:"regular"},
  {verb:"mudar",meaning:"to change",type:"regular"},
  {verb:"multiplicar",meaning:"to multiply",type:"regular"},
  {verb:"murmurar",meaning:"to murmur",type:"regular"},
  {verb:"nadar",meaning:"to swim",type:"regular"},
  {verb:"namorar",meaning:"to fall in love",type:"regular"},
  {verb:"narrar",meaning:"to narrate",type:"regular"},
  {verb:"nascer",meaning:"to be born",type:"regular"},
  {verb:"navegar",meaning:"to browse",type:"regular"},
  {verb:"necessitar",meaning:"to need",type:"regular"},
  {verb:"negar",meaning:"to deny",type:"regular"},
  {verb:"negociar",meaning:"to negotiate",type:"regular"},
  {verb:"nomear",meaning:"to name",type:"regular"},
  {verb:"notar",meaning:"to notice",type:"regular"},
  {verb:"noticiar",meaning:"to report",type:"regular"},
  {verb:"obedecer",meaning:"to obey",type:"regular"},
  {verb:"obrigar",meaning:"to force",type:"regular"},
  {verb:"observar",meaning:"to observe",type:"regular"},
  {verb:"obter",meaning:"to obtain",type:"irregular"},
  {verb:"ocorrer",meaning:"to occur",type:"regular"},
  {verb:"ocultar",meaning:"to hide",type:"regular"},
  {verb:"ocupar",meaning:"to occupy",type:"regular"},
  {verb:"odiar",meaning:"to hate",type:"regular"},
  {verb:"ofender",meaning:"to offend",type:"regular"},
  {verb:"oferecer",meaning:"to offer",type:"regular"},
  {verb:"olhar",meaning:"to look",type:"regular"},
  {verb:"operar",meaning:"to operate",type:"regular"},
  {verb:"opor",meaning:"to oppose",type:"irregular"},
  {verb:"optar",meaning:"to choose",type:"regular"},
  {verb:"ordenar",meaning:"to order",type:"regular"},
  {verb:"organizar",meaning:"to organize",type:"regular"},
  {verb:"orientar",meaning:"to guide",type:"regular"},
  {verb:"originar",meaning:"to originate",type:"regular"},
  {verb:"oscilar",meaning:"to oscillate",type:"regular"},
  {verb:"ostentar",meaning:"to boast",type:"regular"},
  {verb:"ousar",meaning:"to dare",type:"regular"},
  {verb:"ouvir",meaning:"to hear",type:"irregular"},
  {verb:"pagar",meaning:"to pay",type:"regular"},
  {verb:"pairar",meaning:"to hover",type:"regular"},
  {verb:"parar",meaning:"to stop",type:"regular"},
  {verb:"parecer",meaning:"to seem",type:"regular"},
  {verb:"parir",meaning:"to give birth",type:"regular"},
  {verb:"participar",meaning:"to participate",type:"regular"},
  {verb:"partilhar",meaning:"to share",type:"regular"},
  {verb:"partir",meaning:"to leave",type:"regular"},
  {verb:"passar",meaning:"to spend",type:"regular"},
  {verb:"passear",meaning:"to stroll",type:"regular"},
  {verb:"pedir",meaning:"to ask",type:"irregular"},
  {verb:"pegar",meaning:"to take",type:"regular"},
  {verb:"pender",meaning:"to hang",type:"regular"},
  {verb:"penetrar",meaning:"to penetrate",type:"regular"},
  {verb:"pensar",meaning:"to think",type:"regular"},
  {verb:"perceber",meaning:"to perceive",type:"regular"},
  {verb:"percorrer",meaning:"to go through",type:"regular"},
  {verb:"perder",meaning:"to lose",type:"regular"},
  {verb:"perdoar",meaning:"to forgive",type:"regular"},
  {verb:"perguntar",meaning:"to ask",type:"regular"},
  {verb:"permanecer",meaning:"to stay",type:"regular"},
  {verb:"permitir",meaning:"to allow",type:"regular"},
  {verb:"perseguir",meaning:"to chase",type:"regular"},
  {verb:"persistir",meaning:"to persist",type:"regular"},
  {verb:"pertencer",meaning:"to belong",type:"regular"},
  {verb:"perturbar",meaning:"to disturb",type:"regular"},
  {verb:"pesar",meaning:"to weight",type:"regular"},
  {verb:"pescar",meaning:"to fish",type:"regular"},
  {verb:"pesquisar",meaning:"to look for",type:"regular"},
  {verb:"picar",meaning:"to sting",type:"regular"},
  {verb:"pintar",meaning:"to paint",type:"regular"},
  {verb:"pisar",meaning:"to step",type:"regular"},
  {verb:"planejar",meaning:"to plan",type:"regular"},
  {verb:"plantar",meaning:"to plant",type:"regular"},
  {verb:"poder",meaning:"to power",type:"irregular"},
  {verb:"ponderar",meaning:"to ponder",type:"regular"},
  {verb:"possibilitar",meaning:"to enable",type:"regular"},
  {verb:"possuir",meaning:"to possess",type:"regular"},
  {verb:"poupar",meaning:"to save",type:"regular"},
  {verb:"pousar",meaning:"to land",type:"regular"},
  {verb:"praticar",meaning:"to practice",type:"regular"},
  {verb:"preceder",meaning:"to precede",type:"regular"},
  {verb:"precipitar",meaning:"to precipitate",type:"regular"},
  {verb:"precisar",meaning:"to need",type:"regular"},
  {verb:"predominar",meaning:"to predominate",type:"regular"},
  {verb:"preencher",meaning:"to fill in",type:"regular"},
  {verb:"preferir",meaning:"to prefer",type:"regular"},
  {verb:"pregar",meaning:"to preach",type:"regular"},
  {verb:"prejudicar",meaning:"to harm",type:"regular"},
  {verb:"prender",meaning:"to secure",type:"regular"},
  {verb:"preocupar",meaning:"to worry",type:"regular"},
  {verb:"preparar",meaning:"to prepare",type:"regular"},
  {verb:"preservar",meaning:"to preserve",type:"regular"},
  {verb:"presidir",meaning:"to preside",type:"regular"},
  {verb:"pressentir",meaning:"to envision",type:"regular"},
  {verb:"pressionar",meaning:"to press",type:"regular"},
  {verb:"prestar",meaning:"to provide",type:"regular"},
  {verb:"pretender",meaning:"to intend",type:"regular"},
  {verb:"prevalecer",meaning:"to prevail",type:"regular"},
  {verb:"prevenir",meaning:"to prevent",type:"regular"},
  {verb:"prever",meaning:"to predict",type:"irregular"},
  {verb:"proceder",meaning:"to proceed",type:"regular"},
  {verb:"processar",meaning:"to process",type:"regular"},
  {verb:"proclamar",meaning:"to proclaim",type:"regular"},
  {verb:"procurar",meaning:"to search for",type:"regular"},
  {verb:"produzir",meaning:"to produce",type:"regular"},
  {verb:"proferir",meaning:"to utter",type:"regular"},
  {verb:"proibir",meaning:"to forbid",type:"regular"},
  {verb:"projectar",meaning:"to project",type:"regular"},
  {verb:"prolongar",meaning:"to extend",type:"regular"},
  {verb:"prometer",meaning:"to promise",type:"regular"},
  {verb:"promover",meaning:"to promote",type:"regular"},
  {verb:"pronunciar",meaning:"to pronounce",type:"regular"},
  {verb:"propor",meaning:"to propose",type:"irregular"},
  {verb:"proporcionar",meaning:"to provide",type:"regular"},
  {verb:"prosseguir",meaning:"to proceed",type:"regular"},
  {verb:"proteger",meaning:"to protect",type:"regular"},
  {verb:"protestar",meaning:"to protest",type:"regular"},
  {verb:"provar",meaning:"to test",type:"regular"},
  {verb:"provir",meaning:"to come",type:"irregular"},
  {verb:"provocar",meaning:"to tease",type:"regular"},
  {verb:"publicar",meaning:"to publish",type:"regular"},
  {verb:"pular",meaning:"to jump",type:"regular"},
  {verb:"punir",meaning:"to punish",type:"regular"},
  {verb:"puxar",meaning:"to pull",type:"regular"},
  {verb:"pôr",meaning:"to per",type:"irregular"},
  {verb:"quebrar",meaning:"to break",type:"regular"},
  {verb:"queimar",meaning:"to burn",type:"regular"},
  {verb:"queixar",meaning:"to complain",type:"regular"},
  {verb:"querer",meaning:"to want",type:"irregular"},
  {verb:"questionar",meaning:"to question",type:"regular"},
  {verb:"ranger",meaning:"to creak",type:"regular"},
  {verb:"rasgar",meaning:"to tear apart",type:"regular"},
  {verb:"reafirmar",meaning:"to reaffirm",type:"regular"},
  {verb:"reagir",meaning:"to react",type:"regular"},
  {verb:"realizar",meaning:"to accomplish",type:"regular"},
  {verb:"realçar",meaning:"to enhance",type:"regular"},
  {verb:"reaparecer",meaning:"to reappear",type:"regular"},
  {verb:"rebater",meaning:"to bat",type:"regular"},
  {verb:"rebentar",meaning:"to bust",type:"regular"},
  {verb:"recear",meaning:"to fear",type:"regular"},
  {verb:"receber",meaning:"to receive",type:"regular"},
  {verb:"reclamar",meaning:"to complain",type:"regular"},
  {verb:"recolher",meaning:"to recall",type:"regular"},
  {verb:"recomendar",meaning:"to recommend",type:"regular"},
  {verb:"recomeçar",meaning:"to restart",type:"regular"},
  {verb:"reconhecer",meaning:"to recognize",type:"regular"},
  {verb:"recordar",meaning:"to remember",type:"regular"},
  {verb:"recorrer",meaning:"to resort",type:"regular"},
  {verb:"recuar",meaning:"to back off",type:"regular"},
  {verb:"recuperar",meaning:"to recover",type:"regular"},
  {verb:"recusar",meaning:"to refuse",type:"regular"},
  {verb:"reduzir",meaning:"to reduce",type:"regular"},
  {verb:"referir",meaning:"to refer",type:"regular"},
  {verb:"reflectir",meaning:"to reflect",type:"regular"},
  {verb:"reformar",meaning:"to reform",type:"regular"},
  {verb:"reforçar",meaning:"to reinforce",type:"regular"},
  {verb:"refugiar",meaning:"to take refuge",type:"regular"},
  {verb:"reger",meaning:"to rule",type:"regular"},
  {verb:"registar",meaning:"to register",type:"regular"},
  {verb:"registrar",meaning:"to register",type:"regular"},
  {verb:"regressar",meaning:"to return",type:"regular"},
  {verb:"regular",meaning:"to regular",type:"regular"},
  {verb:"reinar",meaning:"to reign",type:"regular"},
  {verb:"reivindicar",meaning:"to claim",type:"regular"},
  {verb:"rejeitar",meaning:"to reject",type:"regular"},
  {verb:"relacionar",meaning:"to list",type:"regular"},
  {verb:"relatar",meaning:"to report",type:"regular"},
  {verb:"relembrar",meaning:"to remember",type:"regular"},
  {verb:"rematar",meaning:"to finish off",type:"regular"},
  {verb:"remeter",meaning:"to forward",type:"regular"},
  {verb:"remover",meaning:"to remove",type:"regular"},
  {verb:"render",meaning:"to render",type:"regular"},
  {verb:"renovar",meaning:"to renew",type:"regular"},
  {verb:"renunciar",meaning:"to waive",type:"regular"},
  {verb:"reparar",meaning:"to repair",type:"regular"},
  {verb:"repetir",meaning:"to repeat",type:"regular"},
  {verb:"replicar",meaning:"to replicate",type:"regular"},
  {verb:"repousar",meaning:"to rest",type:"regular"},
  {verb:"representar",meaning:"to represent",type:"regular"},
  {verb:"reprimir",meaning:"to repress",type:"regular"},
  {verb:"reproduzir",meaning:"to reproduce",type:"regular"},
  {verb:"requerer",meaning:"to require",type:"irregular"},
  {verb:"reservar",meaning:"to reserve",type:"regular"},
  {verb:"resgatar",meaning:"to rescue",type:"regular"},
  {verb:"residir",meaning:"to reside",type:"regular"},
  {verb:"resistir",meaning:"to resist",type:"regular"},
  {verb:"resmungar",meaning:"to grumble",type:"regular"},
  {verb:"resolver",meaning:"to solve",type:"regular"},
  {verb:"respeitar",meaning:"to respect",type:"regular"},
  {verb:"respirar",meaning:"to breathe",type:"regular"},
  {verb:"responder",meaning:"to respond",type:"regular"},
  {verb:"responsabilizar",meaning:"to blame",type:"regular"},
  {verb:"ressaltar",meaning:"to emphasize",type:"regular"},
  {verb:"restabelecer",meaning:"to restore",type:"regular"},
  {verb:"restar",meaning:"to remain",type:"regular"},
  {verb:"restaurar",meaning:"to restore",type:"regular"},
  {verb:"restringir",meaning:"to restrict",type:"regular"},
  {verb:"resultar",meaning:"to result",type:"regular"},
  {verb:"resumir",meaning:"to sum up",type:"regular"},
  {verb:"reter",meaning:"to retain",type:"irregular"},
  {verb:"retirar",meaning:"to remove",type:"regular"},
  {verb:"retomar",meaning:"to resume",type:"regular"},
  {verb:"retornar",meaning:"to turn back",type:"regular"},
  {verb:"retratar",meaning:"to portray",type:"regular"},
  {verb:"reunir",meaning:"to get together",type:"regular"},
  {verb:"revelar",meaning:"to reveal",type:"regular"},
  {verb:"rever",meaning:"to review",type:"irregular"},
  {verb:"revestir",meaning:"to coat",type:"regular"},
  {verb:"rezar",meaning:"to pray",type:"regular"},
  {verb:"rir",meaning:"to laugh",type:"irregular"},
  {verb:"rodar",meaning:"to rotate",type:"regular"},
  {verb:"rodear",meaning:"to surround",type:"regular"},
  {verb:"roer",meaning:"to gnaw",type:"regular"},
  {verb:"rolar",meaning:"to roll",type:"regular"},
  {verb:"romper",meaning:"to break up",type:"regular"},
  {verb:"rondar",meaning:"to prowl",type:"regular"},
  {verb:"roubar",meaning:"to steal",type:"regular"},
  {verb:"roçar",meaning:"to skim",type:"regular"},
  {verb:"saber",meaning:"to know",type:"irregular"},
  {verb:"sacudir",meaning:"to shake",type:"regular"},
  {verb:"sair",meaning:"to go out",type:"irregular"},
  {verb:"salientar",meaning:"to stress",type:"regular"},
  {verb:"saltar",meaning:"to jump",type:"regular"},
  {verb:"salvar",meaning:"to save",type:"regular"},
  {verb:"satisfazer",meaning:"to satisfy",type:"irregular"},
  {verb:"saudar",meaning:"to salute",type:"regular"},
  {verb:"secar",meaning:"to dry",type:"regular"},
  {verb:"seguir",meaning:"to follow",type:"regular"},
  {verb:"segurar",meaning:"to hold",type:"regular"},
  {verb:"seleccionar",meaning:"to select",type:"regular"},
  {verb:"semear",meaning:"to sow",type:"regular"},
  {verb:"sentar",meaning:"to sit",type:"regular"},
  {verb:"sentir",meaning:"to feel",type:"regular"},
  {verb:"separar",meaning:"to separate",type:"regular"},
  {verb:"sequestrar",meaning:"to kidnap",type:"regular"},
  {verb:"ser",meaning:"to be",type:"irregular"},
  {verb:"servir",meaning:"to serve",type:"regular"},
  {verb:"significar",meaning:"to mean",type:"regular"},
  {verb:"situar",meaning:"to situate",type:"regular"},
  {verb:"soar",meaning:"to sound",type:"regular"},
  {verb:"sobrar",meaning:"to left over",type:"regular"},
  {verb:"sobreviver",meaning:"to survive",type:"regular"},
  {verb:"sofrer",meaning:"to suffer",type:"regular"},
  {verb:"solicitar",meaning:"to request",type:"regular"},
  {verb:"soltar",meaning:"to release",type:"regular"},
  {verb:"soluçar",meaning:"to hiccup",type:"regular"},
  {verb:"somar",meaning:"to add",type:"regular"},
  {verb:"sonhar",meaning:"to dream",type:"regular"},
  {verb:"soprar",meaning:"to blow",type:"regular"},
  {verb:"sorrir",meaning:"to smile",type:"regular"},
  {verb:"suar",meaning:"to sweat",type:"regular"},
  {verb:"subir",meaning:"to move up",type:"regular"},
  {verb:"sublinhar",meaning:"to highlight",type:"regular"},
  {verb:"submeter",meaning:"to submit",type:"regular"},
  {verb:"substantivar",meaning:"to substantive",type:"regular"},
  {verb:"substituir",meaning:"to replace",type:"regular"},
  {verb:"suceder",meaning:"to succeed",type:"regular"},
  {verb:"sufocar",meaning:"to suffocate",type:"regular"},
  {verb:"sugerir",meaning:"to suggest",type:"regular"},
  {verb:"sujeitar",meaning:"to subject",type:"regular"},
  {verb:"sumir",meaning:"to disappear",type:"regular"},
  {verb:"superar",meaning:"to overcome",type:"regular"},
  {verb:"supor",meaning:"to suppose",type:"irregular"},
  {verb:"suportar",meaning:"to support",type:"regular"},
  {verb:"surgir",meaning:"to emerge",type:"regular"},
  {verb:"surpreender",meaning:"to surprise",type:"regular"},
  {verb:"suscitar",meaning:"to arouse",type:"regular"},
  {verb:"suspeitar",meaning:"to suspect",type:"regular"},
  {verb:"suspender",meaning:"to suspend",type:"regular"},
  {verb:"suspirar",meaning:"to sigh",type:"regular"},
  {verb:"sustentar",meaning:"to sustain",type:"regular"},
  {verb:"tapar",meaning:"to close",type:"regular"},
  {verb:"tardar",meaning:"to delay",type:"regular"},
  {verb:"tecer",meaning:"to weave",type:"regular"},
  {verb:"teimar",meaning:"to stubborn",type:"regular"},
  {verb:"telefonar",meaning:"to phone",type:"regular"},
  {verb:"temer",meaning:"to fear",type:"regular"},
  {verb:"tender",meaning:"to tend",type:"regular"},
  {verb:"tentar",meaning:"to try",type:"regular"},
  {verb:"ter",meaning:"to have",type:"irregular"},
  {verb:"terminar",meaning:"to finish",type:"regular"},
  {verb:"testar",meaning:"to test",type:"regular"},
  {verb:"tirar",meaning:"to throw",type:"regular"},
  {verb:"tocar",meaning:"to touch",type:"regular"},
  {verb:"tomar",meaning:"to take",type:"regular"},
  {verb:"tombar",meaning:"to topple",type:"regular"},
  {verb:"torcer",meaning:"to twist",type:"regular"},
  {verb:"tornar",meaning:"to become",type:"regular"},
  {verb:"torturar",meaning:"to torture",type:"regular"},
  {verb:"trabalhar",meaning:"to work",type:"regular"},
  {verb:"traduzir",meaning:"to translate",type:"regular"},
  {verb:"trair",meaning:"to betray",type:"irregular"},
  {verb:"transferir",meaning:"to transfer",type:"regular"},
  {verb:"transformar",meaning:"to transform",type:"regular"},
  {verb:"transmitir",meaning:"to transmit",type:"regular"},
  {verb:"transportar",meaning:"to carry",type:"regular"},
  {verb:"tratar",meaning:"to deal with",type:"regular"},
  {verb:"travar",meaning:"to lock",type:"regular"},
  {verb:"trazer",meaning:"to bring",type:"irregular"},
  {verb:"traçar",meaning:"to draw",type:"regular"},
  {verb:"treinar",meaning:"to train",type:"regular"},
  {verb:"tremer",meaning:"to shake",type:"regular"},
  {verb:"trocar",meaning:"to replace",type:"regular"},
  {verb:"ultrapassar",meaning:"to surpass",type:"regular"},
  {verb:"unir",meaning:"to join",type:"regular"},
  {verb:"usar",meaning:"to use",type:"regular"},
  {verb:"utilizar",meaning:"to use",type:"regular"},
  {verb:"vagar",meaning:"to wander",type:"regular"},
  {verb:"valer",meaning:"to worth",type:"irregular"},
  {verb:"valorizar",meaning:"to value",type:"regular"},
  {verb:"variar",meaning:"to vary",type:"regular"},
  {verb:"varrer",meaning:"to sweep",type:"regular"},
  {verb:"velar",meaning:"to watch over",type:"regular"},
  {verb:"vencer",meaning:"to win",type:"regular"},
  {verb:"vender",meaning:"to sell",type:"regular"},
  {verb:"ver",meaning:"to see",type:"irregular"},
  {verb:"verificar",meaning:"to check",type:"regular"},
  {verb:"vestir",meaning:"to wear",type:"regular"},
  {verb:"viabilizar",meaning:"to enable",type:"regular"},
  {verb:"viajar",meaning:"to travel",type:"regular"},
  {verb:"vibrar",meaning:"to vibrate",type:"regular"},
  {verb:"vigiar",meaning:"to watch",type:"regular"},
  {verb:"vingar",meaning:"to avenge",type:"regular"},
  {verb:"violar",meaning:"to violate",type:"regular"},
  {verb:"vir",meaning:"to come over",type:"irregular"},
  {verb:"virar",meaning:"to turn",type:"regular"},
  {verb:"visar",meaning:"to aim",type:"regular"},
  {verb:"visitar",meaning:"to visit",type:"regular"},
  {verb:"viver",meaning:"to live",type:"regular"},
  {verb:"voar",meaning:"to fly",type:"regular"},
  {verb:"voltar",meaning:"to go back",type:"regular"},
  {verb:"votar",meaning:"to vote",type:"regular"}

];

const CLEAN_VERB_LIST = VERB_LIST.filter((v, i, arr) => arr.findIndex(x => x.verb === v.verb) === i);

function getVerbEnding(verb) {
  if (verb === "pôr") return "er";
  if (verb.endsWith("ar")) return "ar";
  if (verb.endsWith("er")) return "er";
  if (verb.endsWith("ir")) return "ir";
  return "ar";
}
function getStem(verb) {
  if (verb === "pôr") return "p";
  return verb.slice(0, -2);
}
function conjugateVerb(verb) {
  const irregular = IRREGULAR_VERBS[verb];
  const ending = getVerbEnding(verb);
  const stem = getStem(verb);
  const endings = REGULAR_ENDINGS[ending];
  const result = {};
  for (const group of TENSE_GROUPS) {
    for (const tense of group.tenses) {
      if (irregular && irregular[tense]) {
        result[tense] = irregular[tense];
      } else if (endings[tense]) {
        if (tense === "Gerúndio" || tense === "Particípio") {
          result[tense] = [stem + endings[tense][0]];
        } else if (tense === "Futuro do Presente" || tense === "Futuro do Pretérito") {
          result[tense] = endings[tense].map(e => verb === "pôr" ? "por" + e.slice(ending.length) : stem + e);
        } else {
          result[tense] = endings[tense].map(e => stem + e);
        }
      }
    }
  }
  return result;
}

function buildSearchIndex(verbs) {
  const index = {};
  for (const { verb } of verbs) {
    const conjugations = conjugateVerb(verb);
    for (const [tense, forms] of Object.entries(conjugations)) {
      for (let i = 0; i < forms.length; i++) {
        const raw = forms[i].toLowerCase().replace("—", "");
        if (!raw) continue;
        const alternatives = raw.split("/");
        for (const alt of alternatives) {
          const trimmed = alt.trim();
          if (!trimmed) continue;
          if (!index[trimmed]) index[trimmed] = [];
          const pronoun = forms.length === 1 ? null : PRONOUNS[i];
          index[trimmed].push({ verb, tense, pronoun, form: trimmed });
        }
      }
    }
  }
  return index;
}

// Icons
const SearchIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const BackIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>;
const ChevronIcon = ({ open }) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s" }}><polyline points="9 18 15 12 9 6"/></svg>;
const ClearIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const StarIcon = ({ filled }) => <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? "#c4942a" : "none"} stroke={filled ? "#c4942a" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const NoteIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>;
const IrregularBadge = () => <span style={{display:"inline-block",padding:"1px 6px",fontSize:"10px",fontWeight:700,letterSpacing:"0.05em",textTransform:"uppercase",background:"#fbbf24",color:"#78350f",borderRadius:"4px"}}>irr.</span>;

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=IBM+Plex+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
:root{--bg:#faf8f5;--bg2:#f3efe9;--surface:#fff;--border:#e8e0d4;--border2:#d4c9b8;--text:#1a1612;--text2:#6b5e4f;--text3:#9a8d7e;--accent:#1e5c8a;--accent2:#15405f;--accent-light:#e8f0f7;--gold:#c4942a;--gold-light:#fef9ee;--radius:10px}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'IBM Plex Sans',sans-serif;background:var(--bg);color:var(--text);-webkit-font-smoothing:antialiased}
.app{min-height:100vh;display:flex;flex-direction:column}
.header{background:var(--text);color:var(--bg);padding:20px 16px 16px;position:sticky;top:0;z-index:100}
.header-inner{max-width:720px;margin:0 auto}
.header h1{font-family:'DM Serif Display',serif;font-size:22px;font-weight:400;letter-spacing:-0.01em;line-height:1.2}
.header h1 span{color:var(--gold)}
.header-subtitle{font-size:12px;color:var(--text3);margin-top:2px;font-weight:300;letter-spacing:0.03em}
.search-wrap{position:relative;margin-top:12px}
.search-wrap .s-icon{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--text3);display:flex}
.search-input{width:100%;padding:11px 40px 11px 38px;border:none;border-radius:8px;font-size:15px;font-family:'IBM Plex Sans',sans-serif;background:rgba(255,255,255,0.1);color:#fff;outline:none;transition:background 0.2s}
.search-input::placeholder{color:rgba(255,255,255,0.35)}
.search-input:focus{background:rgba(255,255,255,0.16)}
.clear-btn{position:absolute;right:8px;top:50%;transform:translateY(-50%);background:rgba(255,255,255,0.15);border:none;color:rgba(255,255,255,0.6);cursor:pointer;border-radius:50%;width:26px;height:26px;display:flex;align-items:center;justify-content:center;transition:background 0.15s}
.clear-btn:hover{background:rgba(255,255,255,0.25)}
.search-hint{display:flex;align-items:center;gap:6px;margin-top:8px;font-size:12px;color:rgba(255,255,255,0.4);font-weight:300}
.search-hint-dot{width:4px;height:4px;border-radius:50%;background:var(--gold);flex-shrink:0}
.main{flex:1;max-width:720px;margin:0 auto;width:100%;padding:0 16px 80px}
.reverse-banner{margin-top:16px;padding:14px 16px;background:var(--accent-light);border-left:4px solid var(--accent);border-radius:0 var(--radius) var(--radius) 0}
.reverse-banner-label{font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:var(--accent);margin-bottom:8px}
.reverse-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:12px 14px;margin-bottom:6px;cursor:pointer;transition:all 0.15s;display:flex;align-items:center;justify-content:space-between;gap:10px}
.reverse-card:last-child{margin-bottom:0}
.reverse-card:hover{border-color:var(--accent);box-shadow:0 2px 8px rgba(30,92,138,0.08)}
.reverse-card-left{min-width:0}
.reverse-verb{font-family:'DM Serif Display',serif;font-size:18px;color:var(--accent);line-height:1.2}
.reverse-detail{font-size:12px;color:var(--text2);margin-top:2px}
.reverse-detail b{font-weight:600}
.reverse-tense{font-size:10px;font-weight:600;background:var(--accent-light);color:var(--accent);padding:3px 8px;border-radius:4px;white-space:nowrap;flex-shrink:0}
.letter-section{margin-top:24px}
.letter-header{font-family:'DM Serif Display',serif;font-size:28px;color:var(--accent);padding-bottom:6px;margin-bottom:8px;border-bottom:2px solid var(--border)}
.verb-item{display:flex;align-items:center;justify-content:space-between;padding:10px 12px;border-radius:var(--radius);cursor:pointer;transition:background 0.15s;gap:8px}
.verb-item:hover{background:var(--bg2)}
.verb-item:active{background:var(--border)}
.verb-name{font-weight:600;font-size:15px;color:var(--text)}
.verb-meaning{font-size:13px;color:var(--text2);font-weight:300}
.verb-meta{display:flex;align-items:center;gap:6px;flex-shrink:0}
.verb-ending{font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--text3);background:var(--bg2);padding:2px 6px;border-radius:4px}
.conj-header{display:flex;align-items:center;gap:12px;padding:20px 0 4px}
.back-btn{display:flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:50%;border:none;background:var(--bg2);cursor:pointer;color:var(--text);transition:background 0.15s;flex-shrink:0}
.back-btn:hover{background:var(--border)}
.conj-title{font-family:'DM Serif Display',serif;font-size:28px;color:var(--text);line-height:1.1}
.conj-subtitle{font-size:14px;color:var(--text2);font-weight:300;margin-top:2px;padding-left:48px}
.tense-group{margin-top:20px}
.group-label{font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--accent);padding:0 4px;margin-bottom:6px}
.tense-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);margin-bottom:6px;overflow:hidden;transition:border-color 0.2s}
.tense-card.open{border-color:var(--border2)}
.tense-card.highlighted{border-color:var(--accent);background:var(--accent-light)}
.tense-header{display:flex;align-items:center;justify-content:space-between;padding:10px 12px;cursor:pointer;user-select:none;background:none;border:none;width:100%;font-family:inherit;color:var(--text);font-size:14px;font-weight:500}
.tense-header:hover{background:var(--bg2)}
.tense-body{padding:2px 12px 12px}
.conj-row{display:flex;align-items:baseline;padding:4px 0;gap:8px}
.conj-pronoun{font-size:12px;color:var(--text3);width:70px;flex-shrink:0;text-align:right;font-weight:500}
.conj-form{font-family:'JetBrains Mono',monospace;font-size:14px;color:var(--text);font-weight:500}
.conj-form.match{color:var(--accent);background:var(--accent-light);padding:1px 4px;border-radius:3px}
.scroll-top{position:fixed;bottom:20px;right:20px;width:44px;height:44px;border-radius:50%;background:var(--text);color:#fff;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,0.2);z-index:50}
.count-bar{padding:12px 4px 0;font-size:12px;color:var(--text3);font-weight:300}
.empty-state{text-align:center;padding:60px 20px;color:var(--text3)}
.filter-bar{display:flex;gap:6px;margin-top:10px}
.filter-btn{padding:6px 14px;border-radius:20px;border:1.5px solid rgba(255,255,255,0.15);background:none;color:rgba(255,255,255,0.5);font-size:12px;font-weight:500;font-family:inherit;cursor:pointer;transition:all 0.15s;display:flex;align-items:center;gap:5px}
.filter-btn svg{width:14px;height:14px}
.filter-btn.active{background:rgba(255,255,255,0.13);color:#fff;border-color:rgba(255,255,255,0.3)}
.filter-btn .fav-count{background:var(--gold);color:#fff;font-size:10px;font-weight:700;min-width:18px;height:18px;border-radius:9px;display:flex;align-items:center;justify-content:center;padding:0 5px}
.star-btn{display:flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:50%;border:none;background:transparent;cursor:pointer;color:var(--text3);transition:all 0.15s;flex-shrink:0;padding:0}
.star-btn:hover{background:var(--gold-light);color:var(--gold)}
.star-btn.active{color:var(--gold)}
.conj-star{margin-left:auto}
.fav-empty{text-align:center;padding:50px 20px;color:var(--text3)}
.fav-empty-star{color:var(--border2);margin-bottom:12px;display:flex;justify-content:center}
.fav-empty-star svg{width:36px;height:36px}
.fav-empty p{font-size:14px;line-height:1.6}
.note-section{margin-top:16px;margin-bottom:4px}
.note-card{background:var(--gold-light);border:1.5px solid #e8dcc0;border-radius:var(--radius);overflow:hidden;transition:border-color 0.2s}
.note-card:focus-within{border-color:var(--gold)}
.note-header{display:flex;align-items:center;gap:6px;padding:10px 12px 0;color:var(--gold);font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase}
.note-header svg{flex-shrink:0}
.note-textarea{width:100%;border:none;background:transparent;padding:8px 12px 10px;font-family:'IBM Plex Sans',sans-serif;font-size:13px;color:var(--text);line-height:1.5;resize:none;outline:none;min-height:36px}
.note-textarea::placeholder{color:var(--text3)}
.note-saved{font-size:10px;font-weight:400;letter-spacing:0.02em;text-transform:none;color:var(--text3);margin-left:auto;opacity:0;transition:opacity 0.3s}
.note-saved.show{opacity:1}
.note-badge{display:inline-flex;align-items:center;justify-content:center;color:var(--gold);flex-shrink:0;opacity:0.7}
@media(min-width:640px){.header{padding:24px 24px 20px}.header h1{font-size:28px}.main{padding:0 24px 80px}.conj-title{font-size:34px}.tense-body{padding:4px 16px 16px}}
@media(min-width:1024px){.header h1{font-size:32px}}
`;

export default function ConjugadorApp() {
  const [search, setSearch] = useState("");
  const [selectedVerb, setSelectedVerb] = useState(null);
  const [highlightTense, setHighlightTense] = useState(null);
  const [openTenses, setOpenTenses] = useState({});
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [favorites, setFavorites] = useState(new Set());
  const [filter, setFilter] = useState("all"); // "all" | "favorites"
  const [favsLoaded, setFavsLoaded] = useState(false);
  const [notes, setNotes] = useState({});
  const [notesLoaded, setNotesLoaded] = useState(false);
  const [noteSaved, setNoteSaved] = useState(false);
  const noteSaveTimer = useRef(null);
  const notesRef = useRef(notes);
  notesRef.current = notes;
  const inputRef = useRef(null);

  // Load favorites + notes from persistent storage
  useEffect(() => {
    (async () => {
      try {
        const val = localStorage.getItem("conjugador-favorites");
        const result = val ? { value: val } : null;
        if (result && result.value) {
          setFavorites(new Set(JSON.parse(result.value)));
        }
      } catch (e) { /* no stored favorites yet */ }
      setFavsLoaded(true);
      try {
        const val = localStorage.getItem("conjugador-notes");
        const result = val ? { value: val } : null;
        if (result && result.value) {
          setNotes(JSON.parse(result.value));
        }
      } catch (e) { /* no stored notes yet */ }
      setNotesLoaded(true);
    })();
  }, []);

  // Save favorites whenever they change
  useEffect(() => {
    if (!favsLoaded) return;
    (async () => {
      try {
        localStorage.setItem("conjugador-favorites", JSON.stringify([...favorites]));
      } catch (e) { console.error("Could not save favorites:", e); }
    })();
  }, [favorites, favsLoaded]);

  const toggleFavorite = useCallback((verb, e) => {
    if (e) e.stopPropagation();
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(verb)) next.delete(verb);
      else next.add(verb);
      return next;
    });
  }, []);

  const updateNote = useCallback((verb, text) => {
    setNotes(prev => {
      const next = { ...prev };
      if (text.trim()) next[verb] = text;
      else delete next[verb];
      return next;
    });
    // Debounced save + flash "guardado"
    if (noteSaveTimer.current) clearTimeout(noteSaveTimer.current);
    noteSaveTimer.current = setTimeout(async () => {
      try {
        localStorage.setItem("conjugador-notes", JSON.stringify(notesRef.current));
        setNoteSaved(true);
        setTimeout(() => setNoteSaved(false), 1500);
      } catch (e) { console.error("Could not save notes:", e); }
    }, 600);
  }, []);

  const searchIndex = useMemo(() => buildSearchIndex(CLEAN_VERB_LIST), []);

  useEffect(() => {
    const h = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  // Unified search: verbs + reverse lookup (respects favorites filter)
  const { verbResults, reverseResults } = useMemo(() => {
    const q = search.toLowerCase().trim();
    const baseList = filter === "favorites"
      ? CLEAN_VERB_LIST.filter(v => favorites.has(v.verb))
      : CLEAN_VERB_LIST;

    if (!q) return { verbResults: baseList, reverseResults: [] };

    const verbResults = baseList.filter(v =>
      v.verb.toLowerCase().includes(q) || v.meaning.toLowerCase().includes(q)
    );

    // Reverse: exact then prefix
    let reverse = searchIndex[q] || [];
    if (reverse.length === 0) {
      for (const [key, entries] of Object.entries(searchIndex)) {
        if (key.startsWith(q)) reverse = [...reverse, ...entries];
      }
    }
    const seen = new Set();
    const deduped = reverse.filter(r => {
      const k = `${r.verb}-${r.tense}-${r.pronoun}`;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    }).slice(0, 20);

    // Don't show reverse results that duplicate the verb list infinitives
    const filtered = deduped.filter(r => {
      if (r.form === r.verb && verbResults.some(v => v.verb === r.verb)) return false;
      return true;
    });

    return { verbResults, reverseResults: filtered };
  }, [search, searchIndex, filter, favorites]);

  const grouped = useMemo(() => {
    const map = {};
    for (const v of verbResults) {
      const letter = v.verb[0].toUpperCase();
      if (!map[letter]) map[letter] = [];
      map[letter].push(v);
    }
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [verbResults]);

  const toggleTense = useCallback((tense) => {
    setOpenTenses(prev => ({ ...prev, [tense]: !prev[tense] }));
  }, []);

  const selectVerb = useCallback((verb, tenseToHighlight = null) => {
    setSelectedVerb(verb);
    if (tenseToHighlight) {
      setOpenTenses({ [tenseToHighlight]: true });
      setHighlightTense(tenseToHighlight);
    } else {
      setOpenTenses({});
      setHighlightTense(null);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const goBack = useCallback(() => {
    setSelectedVerb(null);
    setHighlightTense(null);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const conjugations = useMemo(() => selectedVerb ? conjugateVerb(selectedVerb) : null, [selectedVerb]);
  const verbInfo = useMemo(() => selectedVerb ? CLEAN_VERB_LIST.find(v => v.verb === selectedVerb) : null, [selectedVerb]);
  const matchedForm = search.toLowerCase().trim();

  return (
    <>
      <style>{CSS}</style>
      <div className="app">
        <header className="header">
          <div className="header-inner">
            <h1>Conjugador <span>Português</span></h1>
            <div className="header-subtitle">{CLEAN_VERB_LIST.length} verbos · Todos os tempos verbais</div>
            {!selectedVerb && (
              <>
                <div className="search-wrap">
                  <span className="s-icon"><SearchIcon /></span>
                  <input ref={inputRef} className="search-input" placeholder="Procurar verbo ou forma conjugada..." value={search} onChange={e => setSearch(e.target.value)} autoComplete="off" spellCheck={false} />
                  {search && <button className="clear-btn" onClick={() => setSearch("")}><ClearIcon /></button>}
                </div>
                <div className="search-hint">
                  <span className="search-hint-dot" />
                  Escreva um verbo ou qualquer forma conjugada (ex: abro, fizemos, souberam)
                </div>
                <div className="filter-bar">
                  <button className={`filter-btn ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>Todos</button>
                  <button className={`filter-btn ${filter === "favorites" ? "active" : ""}`} onClick={() => setFilter("favorites")}>
                    <StarIcon filled={filter === "favorites"} />
                    Favoritos
                    {favorites.size > 0 && <span className="fav-count">{favorites.size}</span>}
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        <div className="main">
          {selectedVerb && conjugations ? (
            <div>
              <div className="conj-header">
                <button className="back-btn" onClick={goBack}><BackIcon /></button>
                <div className="conj-title">{selectedVerb}</div>
                <button className={`star-btn conj-star ${favorites.has(selectedVerb) ? "active" : ""}`} onClick={(e) => toggleFavorite(selectedVerb, e)}>
                  <StarIcon filled={favorites.has(selectedVerb)} />
                </button>
              </div>
              <div className="conj-subtitle">
                {verbInfo?.meaning} · {verbInfo?.type === "irregular" ? "Irregular" : `Regular (-${getVerbEnding(selectedVerb)})`}
              </div>
              <div className="note-section">
                <div className="note-card">
                  <div className="note-header">
                    <NoteIcon />
                    Nota
                    <span className={`note-saved ${noteSaved ? "show" : ""}`}>guardado</span>
                  </div>
                  <textarea
                    className="note-textarea"
                    placeholder="Escreve uma nota sobre este verbo..."
                    value={notes[selectedVerb] || ""}
                    onChange={e => updateNote(selectedVerb, e.target.value)}
                    rows={Math.max(2, (notes[selectedVerb] || "").split("\n").length)}
                  />
                </div>
              </div>
              {TENSE_GROUPS.map(group => (
                <div className="tense-group" key={group.group}>
                  <div className="group-label">{group.group}</div>
                  {group.tenses.map(tense => {
                    const forms = conjugations[tense];
                    if (!forms) return null;
                    const isOpen = openTenses[tense] ?? false;
                    const isNominal = tense === "Gerúndio" || tense === "Particípio";
                    const isHighlighted = highlightTense === tense;
                    return (
                      <div className={`tense-card ${isOpen ? "open" : ""} ${isHighlighted ? "highlighted" : ""}`} key={tense}>
                        <button className="tense-header" onClick={() => toggleTense(tense)}>
                          <span>{tense}</span>
                          {!isNominal && <ChevronIcon open={isOpen} />}
                          {isNominal && <span className={`conj-form ${isHighlighted ? "match" : ""}`} style={{fontSize:13}}>{forms[0]}</span>}
                        </button>
                        {isOpen && !isNominal && (
                          <div className="tense-body">
                            {forms.map((form, i) => {
                              const alts = form.toLowerCase().split("/").map(s => s.trim());
                              const isMatch = matchedForm && alts.some(a => a === matchedForm);
                              return (
                                <div className="conj-row" key={i}>
                                  <span className="conj-pronoun">{PRONOUNS[i]}</span>
                                  <span className={`conj-form ${isMatch ? "match" : ""}`}>{form}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          ) : (
            <div>
              {reverseResults.length > 0 && (
                <div className="reverse-banner">
                  <div className="reverse-banner-label">Forma conjugada encontrada</div>
                  {reverseResults.map((r, i) => (
                    <div className="reverse-card" key={i} onClick={() => selectVerb(r.verb, r.tense)}>
                      <div className="reverse-card-left">
                        <div className="reverse-verb">{r.verb}</div>
                        <div className="reverse-detail">
                          {r.pronoun && <><b>{r.pronoun}</b> → </>}
                          <span style={{fontFamily:"'JetBrains Mono',monospace"}}>{r.form}</span>
                        </div>
                      </div>
                      <span className="reverse-tense">{r.tense}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="count-bar">
                {filter === "favorites"
                  ? `${verbResults.length} favorito${verbResults.length !== 1 ? "s" : ""}`
                  : verbResults.length === CLEAN_VERB_LIST.length ? `${CLEAN_VERB_LIST.length} verbos` : `${verbResults.length} verbo${verbResults.length !== 1 ? "s" : ""}`}
              </div>
              {filter === "favorites" && verbResults.length === 0 && !search.trim() && (
                <div className="fav-empty">
                  <div className="fav-empty-star"><StarIcon filled={false} /></div>
                  <p>Ainda não tens verbos favoritos.</p>
                  <p style={{fontSize:13,marginTop:4}}>Toca na estrela ao lado de qualquer verbo para o guardar aqui.</p>
                </div>
              )}
              {grouped.length === 0 && reverseResults.length === 0 && search.trim() && (
                <div className="empty-state"><p>Nenhum resultado para "{search}"</p></div>
              )}
              {grouped.map(([letter, verbs]) => (
                <div className="letter-section" key={letter}>
                  <div className="letter-header">{letter}</div>
                  {verbs.map(v => (
                    <div className="verb-item" key={v.verb} onClick={() => selectVerb(v.verb)}>
                      <div>
                        <span className="verb-name">{v.verb}</span>
                        <span className="verb-meaning" style={{marginLeft:8}}>{v.meaning}</span>
                      </div>
                      <div className="verb-meta">
                        {notes[v.verb] && <span className="note-badge"><NoteIcon /></span>}
                        {v.type === "irregular" && <IrregularBadge />}
                        <span className="verb-ending">-{getVerbEnding(v.verb)}</span>
                        <button className={`star-btn ${favorites.has(v.verb) ? "active" : ""}`} onClick={(e) => toggleFavorite(v.verb, e)} aria-label={favorites.has(v.verb) ? "Remover dos favoritos" : "Adicionar aos favoritos"}>
                          <StarIcon filled={favorites.has(v.verb)} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
        {showScrollTop && (
          <button className="scroll-top" onClick={() => window.scrollTo({top:0,behavior:"smooth"})}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
          </button>
        )}
      </div>
    </>
  );
}