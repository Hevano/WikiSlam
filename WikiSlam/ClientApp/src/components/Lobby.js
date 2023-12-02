import React, {useState, useEffect, useCallback} from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button'
import { LobbyList } from './LobbyList';
import { EditNameModal } from './EditNameModal';
import { Spinner } from 'reactstrap';
import axios from 'axios'
import Results from './Results';
import {Game} from './Game'
import { Stack } from 'react-bootstrap';
import { motion } from 'framer-motion'

const GameStates = {
  Lobby: 'Lobby',
  Game: 'Game',
  Results: 'Results'
};

export function Lobby() {

  const location = useLocation()
  const lobby = location.state.lobby
  const navigate = useNavigate()

  const [user, setUser] = useState(location.state.user)
  const [users, setUsers] = useState()
  const [isLoading, setLoading] = useState(true)
  const [isEditingName, setEditingName] = useState(false)
  const [gameState, setGameState] = useState(GameStates.Results)

  //TODO: Use the proxy routing somehow
  const webSocket = useWebSocket('ws://localhost:3000/socket', {
    onOpen: () => {console.log("opended!")},
    onClose: () => { console.log("closed!"); webSocket.sendMessage(JSON.stringify({userId: user.id, actionType:"leave"}))}
  });


  useEffect(() => {
    webSocket.sendMessage(JSON.stringify({userId: user.id, actionType:"join"}))
  }, []);

  useEffect(() => {
    if (webSocket.lastMessage !== null && users != null) {
      let msgJson = JSON.parse(webSocket.lastMessage.data)

      switch(msgJson.actionType){
        case "join":
          //Convert keys to lowercase
          let keys = Object.keys(msgJson.user)
          for(var keyIndex in keys){
            let key = keys[keyIndex]
            msgJson.user[key.toLowerCase()] = msgJson.user[key]
            delete msgJson.user[key]
          }

          if(user.id === msgJson.user.id) return
          let newUserArray = [...users, msgJson.user]
          setUsers(newUserArray)
          break
        case "leave":
          let filteredUserArray = users.filter((u)=>{ return u.id !== msgJson.user.Id})
          setUsers(filteredUserArray)
        case "start":
          setGameState(GameStates.Game)
          break
        default:
          console.log("UNEXPECTED WEBSOCKET ACTION")
          break
      }
    }
  }, [webSocket.lastMessage]);

  useEffect(()=>{
    axios.get(`api/lobby/${lobby.id}/users`).then(res => {
      setLoading(false)
      console.log(res.data)
      setUsers(res.data)
    })
  },[])

  function removeUsers(u){
    let index = users.indexOf(u);
    let updatedItems = [...users.slice(0,index), ...users.slice(index + 1)]
    setUsers(updatedItems);

    axios({url: `api/user/${u.id}`, method: "delete"}).then(result =>{
      axios.get(`api/lobby/${lobby.id}/users`).then(res => {
        setLoading(false)
        setUsers(res.data)
      })
    })
  }

  function leave(){
    axios({url: `api/user/${user.id}`, method: "delete"}).then(result =>{
      navigate("/")
    })
  }

  function changeName(newName){
    let newUser = structuredClone(user)
    newUser.name = newName
    axios({url: `api/user/${user.id}`, method: "put", data: newUser}).then(result =>{
      setUser(newUser)
      const newUserArray = users.map((u)=>{ return u.id === newUser.id ? newUser : u})
      setUsers(newUserArray)
      setEditingName(false)
    })
  }

  function startGame(){
    webSocket.sendMessage(JSON.stringify({userId: user.id, actionType:"start"}))
    setGameState(GameStates.Game)
  }

  switch(gameState){
    case GameStates.Lobby:
      return (
        <motion.div animate={{x:[-2000, 0]}} transition={{ ease: "easeOut", duration: 0.5 }}>
        <Container fluid>
          <div className='shape'/>
          <EditNameModal show={isEditingName} handleClose={()=>{setEditingName(false)}} handleCreate={changeName} modalTitle={"Change Name"} modalLabel={"Create a new name"}/>
          <Row lg={2} md={1} sm={1}>
            <Col className='col-md-6'>
              <Stack gap={3}>
                <h3 className='m-0 mt-4' style={{fontSize:"40pt", lineHeight: "75%"}}>LOBBY</h3>
                <h1 className='text-light mb-5' style={{fontSize:"100pt", lineHeight: "75%"}}>CODE: {lobby.code ? lobby.code : "???"}</h1>
                <div style={{height: "40vh"}}></div>
                <motion.div className="mx-auto w-75" whileHover={{scale: 1.05}}><Button className="w-100 fs-2" variant='primary' disabled={!user.isAdmin} onClick={startGame}>Start Game</Button></motion.div>
                <motion.div className="mx-auto w-50" whileHover={{scale: 1.05}}><Button className="w-100 fs-3" variant='secondary' onClick={leave}>Leave Lobby</Button></motion.div>
              </Stack>
            </Col>
            <Col className='p-5'>
              <Stack>
                <h3 className='text-center mx-auto'>Players</h3>
                {isLoading ? <Spinner/> : <LobbyList loggedInUser={user} users={users} isAdmin={user.isAdmin} onCloseCallback={removeUsers} onEditCallback={()=>{setEditingName(true)}} />}
              </Stack>
            </Col>
          </Row>
        </Container>
        </motion.div>
      )
    case GameStates.Game:
      return <Game 
        user={user} 
        lobby={lobby} 
        users={users} 
        webSocket={webSocket} 
        toResultsCallback={()=>{setGameState(GameStates.Results)}} 
        sortUsersCallback={(userList)=>{setUsers(userList)}}
      />
    case GameStates.Results:
      return <Results 
      user={user} 
      lobby={lobby} 
      users={users}
      playAgainCallback={()=>{setGameState(GameStates.Lobby); console.log("play again")}}
    />
  }

 
}
