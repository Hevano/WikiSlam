import React, { useState, useCallback, useEffect } from 'react';
import { Container, Row, Col, ListGroup, Card, Stack, Badge, Button, ProgressBar, Placeholder, Spinner } from 'react-bootstrap';
import QuestionBox from './QuestionBox';
import {convert} from 'html-to-text'
import axios from 'axios';
import { motion, useAnimate } from "framer-motion"
import LevelBadge from './LevelBadge';

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
    duration = (parseInt(duration[0]) * 3600) + (parseInt(duration[1]) * 60) + (parseInt(duration[2]))
    let time = 0;
    const interval = setInterval(() => {
      setTimerProgress(t => t + (0.005 * duration))
      time += 0.005 * duration
      if(time > 100){
        clearInterval(interval)
        //toResultsCallback()
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
        image: (res.data.originalimage) ? res.data.originalimage.source : null,
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
        console.log("new Article", newArticle)
        setArticle(newArticle)
        let quoteList = htmlToQuoteList(html)
        setArticleQuestions(quoteList)
        setArticleLoading(false)
        webSocket.sendMessage(JSON.stringify({userId: user.id, article: newArticle, actionType:"article"}))
        axios({url: `api/article`, method: "post", data: newArticle}).then(res => {
          setArticleId(res.data.id)
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

    setArticle(updatedArticle)
    

    updatedArticle.id = articleId
    updatedArticle.userId = user.id

    getQuestions()

    webSocket.sendMessage(JSON.stringify({userId: user.id, article: updatedArticle, actionType:"article"}))
    axios({method:"put", url:`api/article/${articleId}`, data:updatedArticle}).then(res =>{
      //console.log(res)
    })
  }

  return (
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
            <Card className='p-5' style={{height:"50vh"}}>
              <Card.Body>
                {(articleLoading) ? <Placeholder as={Card.Title} animation="glow" className="m-1"><Placeholder xs={12} /></Placeholder> : <Card.Title className="text-center">{article.title}</Card.Title>}
                <Card.Img className="mx-auto" style={{"objectFit": "contain", width: "16em", height: "16em"}} src={(!articleLoading && article.image) ? article.image : "https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png"} />
                <Card.Text>
                  <div className='mx-auto text-center'>{(articleLoading) ? "" : article.desc}</div>
                  <Stack direction='horizontal'>
                    <Badge ref={strRef}className='mx-auto mt-4'>STR: {(!articleLoading) ? article.strength : "???"}</Badge>
                    <Badge ref={dexRef} className='mx-auto mt-4'>DEX: {(!articleLoading) ? article.dexterity : "???"}</Badge>
                    <Badge ref={wilRef} className='mx-auto mt-4'>WIL: {(!articleLoading) ? article.willpower : "???"}</Badge>
                  </Stack>
                </Card.Text>
              </Card.Body>
            </Card>
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
  );
};
