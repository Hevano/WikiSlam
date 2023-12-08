import React, { useState, useCallback, useEffect } from 'react';
import { Container, Row, Col, ListGroup, Card, Stack, Badge, Button, ProgressBar, Placeholder, Spinner } from 'react-bootstrap';
import {convert} from 'html-to-text'
import axios from 'axios';
import { motion, useAnimate } from "framer-motion"
import LevelBadge from './LevelBadge';
import ArticleCard from './ArticleCard';
import QuestionBox from './QuestionBox';

//Audio
import RerollSound from '../assets/Reroll.mp3';
import LevelUpSound from '../assets/LevelUp.mp3';
import LevelDownSound from '../assets/LevelDown.mp3';
import LoadedSound from '../assets/Loaded.mp3';
import ArticleLoadedSound from '../assets/ArticleLoaded.mp3'
import SelectedSound from '../assets/Selected.mp3';
import ReactAudioPlayer from 'react-audio-player';

export function Game({lobby, user, users, webSocket, toResultsCallback, sortUsersCallback}) {

  //Animation hooks
  const [strRef, animateStr] = useAnimate()
  const [dexRef, animateDex] = useAnimate()
  const [wilRef, animateWil] = useAnimate()
  
  
  const [article, setArticle] = useState({})
  const [articleId, setArticleId] = useState()
  const [articleLoading, setArticleLoading] = useState(true)
  const [articleQuestions, setArticleQuestions] = useState([])
  const [randomQuestions, setRandomQuestions] = useState([])
  const [questionsLoading, setQuestionLoading] = useState(true)
  const [timerProgress, setTimerProgress] = useState(0)
  const [lobbyArticles, setLobbyArticles] = useState({})

  //Audio state
  const [rerollAudio, setRerollAudio] = useState()
  const [levelUpAudio, setLevelUpAudio] = useState()
  const [levelDownAudio, setLevelDownAudio] = useState()
  const [selectedAudio, setSelectedAudio] = useState()
  const [loadedAudio, setLoadedAudio] = useState()
  const [articleLoadedAudio, setArticleLoadedAudio] = useState()

  //Handles websocket logic when new message comes in
  useEffect(() => {
    if (webSocket.lastMessage !== null && users != null) {
      let msgJson = JSON.parse(webSocket.lastMessage.data)
      switch(msgJson.actionType){
        case "article":
          let newLobbyArticles  = lobbyArticles
          newLobbyArticles[msgJson.article.userId] = msgJson.article
          setLobbyArticles(newLobbyArticles)
          let sortedUsers = users
          sortedUsers.sort((lhs, rhs)=> {
            return (newLobbyArticles[rhs.id] ? newLobbyArticles[rhs.id].level : 0) - (newLobbyArticles[lhs.id] ? newLobbyArticles[lhs.id].level : 0)
          });
          sortUsersCallback(sortedUsers)
          console.log(sortedUsers)
          break
        default:
          console.log("UNEXPECTED WEBSOCKET ACTION", msgJson.actionType)
          break
      }
    }
  }, [webSocket.lastMessage]);

  //Sets up the timer
  useEffect(()=>{
    let duration = lobby.roundDuration.split(":")
    duration = (parseInt(duration[0]) * 3600) + (parseInt(duration[1]) * 60) + (parseInt(duration[2]));
    let progress = 0;
    const interval = setInterval(() => {
      progress += 0.5;
      setTimerProgress((progress / duration) * 100)
      if(progress / duration > 1){
        clearInterval(interval)
        toResultsCallback()
      } 
    }, 500)
    return () => clearInterval(interval);
  }, [])

  //Clear any round-specific state that may exist from previous round
  useEffect(()=>{
    setLobbyArticles({})
    setArticle({})
    getArticle()
  },[])

  //get new questions once new article has been set (done here to avoid selecting questions before article questions are populated in the state)
  useEffect(()=>{
    if(articleQuestions && articleQuestions.length > 0){
      getQuestions()
    }
  }, [articleId])

  //Creates new article and a set of 4 questions
  function getArticle(){
    if(rerollAudio) rerollAudio.audioEl.current.play()
    setArticleLoading(true)
    setQuestionLoading(true)
    axios.get(`https://en.wikipedia.org/api/rest_v1/page/random/summary`).then(res => {

      const newArticle = {
        level: 0,
        title: res.data.titles.normalized,
        strength: 0,
        dexterity: 0,
        willpower: 0,
        userId: user.id,
        // For front end use only
        image: (res.data.originalimage) ? res.data.originalimage.source : "",
        desc: res.data.description
      }

      axios({url: `https://en.wikipedia.org/w/api.php?format=json&action=parse&page=${res.data.titles.canonical}&prop=text|categories&origin=*`, method: "get"}).then(res => {

        const html = res.data.parse.text["*"]

        const text = convert(html, {
          selectors: [
            { selector: 'a', options: { ignoreHref: true } },
            { selector: 'a.button', format: 'skip' }
          ]
        });

        let citations = text.match(/[\^]/gm)
    
        newArticle.strength = Math.ceil(10 * text.length / 5264)
        newArticle.dexterity = res.data.parse.categories.length
        newArticle.willpower = citations ? citations.length : 1
        setArticle(newArticle)
        let quoteList = htmlToQuoteList(html)
        setArticleQuestions(quoteList)
        setArticleLoading(false)

        if(articleLoadedAudio) articleLoadedAudio.audioEl.current.play()

        webSocket.sendMessage(JSON.stringify({userId: user.id, article: newArticle, actionType:"article"}))
        axios({url: `api/article`, method: "post", data: newArticle}).then(res => {
          setArticleId(res.data.id)
        }).catch(err => {
          if(err.response.status === 409){
            console.log("round ended earlier than expected!");
            toResultsCallback()
          }
        })
      })
    })
  }

  //Generates 4 random quote questions, 1 coming from the current article
  async function getQuestions(){
    setQuestionLoading(true)

    //Get html of random articles for questions
    var questionArticleHtml = []
    async function getArticleForQuestion() {
      try {
        const response = await axios.get(`https://en.wikipedia.org/api/rest_v1/page/random/html`);
        questionArticleHtml.push(response.data);
      } catch (error) {
        console.error(error);
      }
    }
    while(questionArticleHtml.length < 3){
      await getArticleForQuestion()
    }

    //Extract random quotes from articles and update state
    const newQuestions = []
    questionArticleHtml.forEach(html => {
      let quotes = htmlToQuoteList(html)
      let quote = quotes[Math.floor(Math.random() * quotes.length)]
      newQuestions.push({correctAnswer: false, text:quote})
    })

    //Place real quote at random index
    let articleQuestion = {correctAnswer: true, text: articleQuestions[Math.floor(Math.random() * articleQuestions.length)]}

    let randomIndex = Math.floor(Math.random() * 4)
    newQuestions.splice(randomIndex,0,articleQuestion)

    setRandomQuestions(newQuestions)
    setQuestionLoading(false)
    if(loadedAudio) loadedAudio.audioEl.current.play()
  }
  

  //converts html from wikipedia api to list of text quotes
  function htmlToQuoteList(htmlString){
    const text = convert(htmlString, {
      selectors: [
        {selector: "*", option:{length: 200, trimEmptyLines:true, leadingLineBreaks:0}},
        { selector: 'a', options: { ignoreHref: true } },
        { selector: 'a.button', format: 'skip' },
        { selector: 'li', format: 'skip' },
        { selector: 'ul', format: 'skip' },
        { selector: 'ol', format: 'skip' },
        { selector: 'img', format: 'skip' },
        { selector: 'table', format: 'skip' },
        { selector: 'h2', format: 'skip' }
      ]
    });
    const regex = /[A-Z]([\s\n]?[\w\(\)\-,:]+)+/gm;
    let matches = text.match(regex)
    matches = matches.filter(s => {
      return s.length > 15
    })
    return matches
  }

  //Callback for when user selects an answer to a question
  function answerQuestion(wasCorrect){
    if(selectedAudio) selectedAudio.audioEl.current.play()
    const updatedArticle = article
    updatedArticle.level += (wasCorrect) ? 1 : -1
    const modifier = (wasCorrect) ? 1.5 : 0.6
    let randomChoice = Math.floor(Math.random() * 3)
    switch(randomChoice){
      case 0:
        article.strength = Math.floor(article.strength * modifier)
        animateStr(strRef.current, {scale:[1,3.5,1]})
        break
      case 1:
        article.dexterity = Math.floor(article.dexterity * modifier)
        animateDex(dexRef.current, {scale:[1,3.5,1]})
        break
      case 2:
        article.willpower = Math.floor(article.willpower * modifier)
        animateWil(wilRef.current, {scale:[1,3.5,1]})
        break
      default:
        break
    }

    if(wasCorrect){
      console.log(levelUpAudio)
      if(levelUpAudio) levelUpAudio.audioEl.current.play()
    } else {
      if(levelDownAudio) levelDownAudio.audioEl.current.play()
    }

    setArticle(updatedArticle)
    

    updatedArticle.id = articleId
    updatedArticle.userId = user.id

    getQuestions()

    webSocket.sendMessage(JSON.stringify({userId: user.id, article: updatedArticle, actionType:"article"}))
    axios({method:"put", url:`api/article/${articleId}`, data:updatedArticle}).then(res =>{
      //console.log(res)
    }).catch(err => {
      console.log(err);
      if(err.response.status === 409){
        console.log("round ended earlier than expected!");
        toResultsCallback()
      }
    })
  }

  return (
    <motion.div animate={{x:[-2000, 0]}} transition={{ ease: "easeOut", duration: 0.5 }}>
    <ReactAudioPlayer
        src={RerollSound}
        preload="auto"
        ref={(element) => {setRerollAudio(element)}}
      />
      <ReactAudioPlayer
        src={LevelDownSound}
        preload="auto"
        ref={(element) => {setLevelDownAudio(element)}}
      />
      <ReactAudioPlayer
        src={LevelUpSound}
        preload="auto"
        ref={(element) => {setLevelUpAudio(element)}}
      />
      <ReactAudioPlayer
        src={LoadedSound}
        preload="auto"
        ref={(element) => {setLoadedAudio(element)}}
      />
      <ReactAudioPlayer
        src={ArticleLoadedSound}
        preload="auto"
        ref={(element) => {setArticleLoadedAudio(element)}}
      />
      <ReactAudioPlayer
        src={SelectedSound}
        preload="auto"
        ref={(element) => {setSelectedAudio(element)}}
        volume={0.5}
      />
    <Container fluid className='p-0'>
      <Row>
      <Col className='bg-secondary col-2 min-vh-100'>
        <h1 style={{color:"white", textAlign:"center"}}>WikiSlam</h1>
        <ListGroup>
          {users.map((u)=>{
            return (<ListGroup.Item key={u.id}><Stack direction='horizontal'><span>{u.name}</span> <LevelBadge spacing="ms-auto" size={1} article={lobbyArticles[u.id]} isLoading={!lobbyArticles.hasOwnProperty(u.id)}/></Stack></ListGroup.Item>)
          })}
        </ListGroup>
      </Col>
      <Col>
        <Stack>
          <ProgressBar animated variant='warning' className="m-4" now={timerProgress} />
          <Stack direction="horizontal" gap={6}>
            <LevelBadge spacing="mx-auto" size={3} article={article} isLoading={articleLoading}/>
            <ArticleCard article={article} articleLoading={articleLoading} strRef={strRef} dexRef={dexRef} wilRef={wilRef}/>
            <div className='mx-auto'>
              <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }} transition={{ type: "spring", stiffness: 400, damping: 17 }}>
              <Button variant="warning" className='fs-1 mt-auto mx-auto p-2' disabled={articleLoading || questionsLoading} onClick={getArticle}>🎲</Button>
              </motion.div>
              <p className='text-light mx-auto text-center mb-auto'>REROLL</p>
            </div>
            
          </Stack>
          <QuestionBox isLoading={questionsLoading} questionArray={randomQuestions} questionCallback={answerQuestion}/>
        </Stack>
      </Col>
    </Row>
  </Container>
  </motion.div>
  );
};
