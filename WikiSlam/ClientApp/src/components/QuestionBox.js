import React from 'react'
import { Container, Row, Col, Stack, Badge, Spinner } from 'react-bootstrap'

export default function QuestionBox({questionArray, isLoading, questionCallback}) {

  const lorem = `"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."`

  return (
    <Container>
      <Row>
        <Col>
          <Stack className="m-3 p-3 border rounded" direction='horizontal' onClick={()=>{questionCallback(questionArray[0].correctAnswer)}}>
            {(isLoading) ? 
            <Spinner className='mx-auto'/> : 
            <><Badge className="m-4 p-4">1.</Badge><p>"{questionArray[0].text}"</p></>}</Stack>
        </Col>
        <Col>
          <Stack className="m-3 p-3 border rounded" direction='horizontal' onClick={()=>{questionCallback(questionArray[1].correctAnswer)}}>
            {(isLoading) ? 
            <Spinner className='mx-auto'/> : 
            <><Badge className="m-4 p-4">2.</Badge><p>"{questionArray[1].text}"</p></>}</Stack>
        </Col>
      </Row>
      <Row>
        <Col>
          <Stack className="m-3 p-3 border rounded" direction='horizontal' onClick={()=>{questionCallback(questionArray[2].correctAnswer)}}>
            {(isLoading) ? 
            <Spinner className='mx-auto'/> : 
            <><Badge className="m-4 p-4">3.</Badge><p>"{questionArray[2].text}"</p></>}</Stack>
        </Col>
        <Col>
          <Stack className="m-3 p-3 border rounded" direction='horizontal' onClick={()=>{questionCallback(questionArray[3].correctAnswer)}}>
            {(isLoading) ? 
            <Spinner className='mx-auto'/> : 
            <><Badge className="m-4 p-4">4.</Badge><p>"{questionArray[3].text}"</p></>}</Stack>
        </Col>
      </Row>
    </Container>
  )
}
