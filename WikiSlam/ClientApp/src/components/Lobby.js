import React, {useState, useEffect} from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ListGroup from 'react-bootstrap/ListGroup';
import Button from 'react-bootstrap/Button'
import { LobbyList } from './LobbyList';
import { EditNameModal } from './EditNameModal';
import { Spinner } from 'reactstrap';
import axios from 'axios'

export function Lobby() {

  const location = useLocation()
  const lobbyId = location.state.lobbyId
  const lobbyCode = location.state.lobbyCode

  const navigate = useNavigate()

  const [user, setUser] = useState(location.state.user)
  const [users, setUsers] = useState()
  const [isLoading, setLoading] = useState(true)
  const [isEditingName, setEditingName] = useState(false)

  useEffect(()=>{
    console.log(lobbyId)
    console.log(user)
    axios.get(`api/lobby/${lobbyId}/users`).then(res => {
      console.log(res)
      setLoading(false)
      setUsers(res.data)
    })
  },[])

  function removeUsers(u){
    let index = users.indexOf(u);
    let updatedItems = [...users.slice(0,index), ...users.slice(index + 1)]
    setUsers(updatedItems);

    axios({url: `api/user/${u.id}`, method: "delete"}).then(result =>{
      axios.get(`api/lobby/${lobbyId}/users`).then(res => {
        setLoading(false)
        setUsers(res.data)
      })
    })
  }

  function leave(){
    console.log(user)
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

  return (
    <Container fluid>
      <EditNameModal show={isEditingName} handleClose={()=>{setEditingName(false)}} handleCreate={changeName} modalTitle={"Change Name"} modalLabel={"Create a new name"}/>
      <Row>
        <Col>
          <h3>Lobby</h3>
          <h1>Code: {lobbyCode ? lobbyCode : "???"}</h1>
          <Button variant='primary'>Start Game</Button>
          <Button variant='secondary' onClick={leave}>Leave Lobby</Button>
        </Col>
        <Col>
          {isLoading ? <Spinner/> : <LobbyList loggedInUser={user} users={users} isAdmin={user.isAdmin} onCloseCallback={removeUsers} onEditCallback={()=>{setEditingName(true)}} />}
        </Col>
      </Row>
    </Container>
  )
}
