import React, { useState, useCallback, useEffect } from 'react';
import { Container, Row, Col, ListGroup, Card, Stack, Badge, Button, ProgressBar, Placeholder, Spinner } from 'react-bootstrap';
import QuestionBox from './QuestionBox';
import {convert} from 'html-to-text'
import axios from 'axios';
export function Game({lobby, user, users, webSocket, toResultsCallback, sortUsersCallback}) {
  
  
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
            return (newLobbyArticles[lhs.id] ? newLobbyArticles[lhs.id].level : 0) - (newLobbyArticles[rhs.id] ? newLobbyArticles[rhs.id].level : 0)
          });
          sortUsersCallback(sortedUsers)
          break
        default:
          console.log("UNEXPECTED WEBSOCKET ACTION")
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
        toResultsCallback()
      } 
    }, 500)
    return () => clearInterval(interval);
  }, [])

  //Update the server whenever the article gets updated
  useEffect(()=>{
    if(!article) return;
    console.log("updated article", article)
    axios({url: `api/article`, method: "post", data: article}).then(res => {
      setArticleId(res.data.id)
      getQuestions()
    })
    webSocket.sendMessage(JSON.stringify({userId: user.id, article: article, actionType:"article"}))
  }, [article, article.level])

  //Creates new article and a set of 4 questions
  function getArticle(){
    setArticleLoading(true)
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
        newArticle.willpower = citations ? citations.length : 0
        console.log("new Article", newArticle)
        setArticle(newArticle)
        let quoteList = htmlToQuoteList(html)
        setArticleQuestions(quoteList)
        setArticleLoading(false)
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
        break
      case 1:
        article.dexterity = Math.floor(article.dexterity * modifier)
        break
      case 2:
        article.willpower = Math.floor(article.willpower * modifier)
        break
      default:
        break
    }

    setArticle(updatedArticle)

    updatedArticle.id = articleId
    updatedArticle.userId = user.id

    getQuestions()

    axios({method:"put", url:`api/article/${articleId}`, data:updatedArticle}).then(res =>{
      //console.log(res)
    })
  }

  return (
    <Container fluid>
      <Row>
      <Col className='color-primary col-2'>
        <h1 style={{color:"white", textAlign:"center"}}>WikiSlam</h1>
        <ListGroup>
          {users.map((u)=>{
            return (<ListGroup.Item>{u.name} {lobbyArticles[u.id] && <Badge>{lobbyArticles[u.id].level}</Badge>}</ListGroup.Item>)
          })}
        </ListGroup>
      </Col>
      <Col>
        <Stack>
          <ProgressBar animated  className="m-4" now={timerProgress} />
          <Stack direction="horizontal" gap={6}>
            <Badge className='mx-auto'>{(articleLoading) ? <Spinner/> : `Lvl ${article.level}`}</Badge>
            <Card style={{width:"60%"}} className='h-5'>
              <Card.Body>
                {(articleLoading) ? <Placeholder as={Card.Title} animation="glow"><Placeholder xs={12} /></Placeholder> : <Card.Title className="text-center">{article.title}</Card.Title>}
                <Card.Img className='mx-auto' style={{width: "auto", height: "15vw", "objectFit": "cover"}} variant="bottom" src={(!articleLoading && article.image) ? article.image : "https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png"} />
                <Card.Text>
                  <div className='mx-auto'>{(articleLoading) ? "" : article.desc}</div>
                  <Stack direction='horizontal'>
                    <Badge className='mx-auto mt-4'>STR: {(article) ? article.strength : "???"}</Badge>
                    <Badge className='mx-auto mt-4'>DEX: {(article) ? article.dexterity : "???"}</Badge>
                    <Badge className='mx-auto mt-4'>WIL: {(article) ? article.willpower : "???"}</Badge>
                  </Stack>
                </Card.Text>
              </Card.Body>
            </Card>
            <Button className='mx-auto' disabled={((articleLoading || questionsLoading) && false)} onClick={getArticle}>Reroll</Button>
          </Stack>
          <QuestionBox isLoading={questionsLoading} questionArray={randomQuestions} questionCallback={answerQuestion}/>
        </Stack>
      </Col>
    </Row>
  </Container>
  );
};
