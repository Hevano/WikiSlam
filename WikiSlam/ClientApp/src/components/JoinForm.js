import React, { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form } from 'react-bootstrap'
import { Button } from 'react-bootstrap'
import {Stack} from 'react-bootstrap'
import axios from 'axios'
import JoinErrorToast from './JoinErrorToast';

export function JoinForm() {

  const navigate = useNavigate()

  const lobbyCodeRef = useRef()
  const userNameRef = useRef()

  const [lobbyCode, setLobbyCode] = useState()
  const [userName, setUserName] = useState()
  const [isLoading, setLoading] = useState(false)
  const [showErrorToast, setErrorToast] = useState(null)

  useEffect(()=>{
    if(!lobbyCode) return
    if(!userName) return
    setLoading(true)
    axios({url: `api/user`, method: "post", data: {name: userName, code: lobbyCode}}).then(result =>{
      const newUser = result.data
      axios.get(`api/lobby/${result.data.lobbyId}`).then(res => {
        navigate("/lobby", {state: {lobby:res.data, user: newUser}})
      })
      
    }).catch(result => {
      console.log(result)
      if(result.response.status === 404){
        setErrorToast(
          {
            title: `Lobby ${lobbyCode} not found`,
            errorMsg: "Make sure to use the correct code"
          }
        )
      } else if(result.response.status === 400){
        setErrorToast(
          {
            title: `Invalid name / lobby code`,
            errorMsg: "Lobby code is 3 letters, name must be 12 letters or less"
          }
        )
      } else {
        setErrorToast(
          {
            title: `Error`,
            errorMsg: result.message
          }
        )
      }
    })
  },[lobbyCode])

  function JoinFormCallback(){
    setUserName(userNameRef.current.value)
    setLobbyCode(lobbyCodeRef.current.value)
  }

  return (
    <Stack>
      {showErrorToast && <JoinErrorToast errorTitle={showErrorToast.title} errorMsg={showErrorToast.errorMsg} dismissCallback={()=>{setErrorToast(null)}}/>}
      <Form>
        <Form.Group className="mb-3" controlId="formLobbyCode">
          <Form.Label>Lobby Code</Form.Label>
          <Form.Control ref={lobbyCodeRef} placeholder="Enter lobby code" />
        </Form.Group>
        <Form.Group className="mb-3" controlId="formName">
          <Form.Label>Name</Form.Label>
          <Form.Control ref={userNameRef} placeholder="Enter your name" />
        </Form.Group>
        <Button variant="primary" type="button" onClick={JoinFormCallback}>
        Join
        </Button>
      </Form>
    </Stack>
    )
}
