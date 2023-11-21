import React from 'react'
import { Container, Row, Col, Stack, Badge, Spinner } from 'react-bootstrap'

export default function QuestionBox({questionArray, isLoading}) {

  const lorem = `"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."`

  return (
    <Container>
      <Row>
        <Col>
          <Stack className="m-3 p-3 border rounded" direction='horizontal'>
            {(isLoading) ? 
            <Spinner className='mx-auto'/> : 
            <><Badge className="m-4 p-4">1.</Badge><p>Quote 1: {lorem}</p></>}</Stack>
        </Col>
        <Col>
          <Stack className="m-3 p-3 border rounded" direction='horizontal'>
            {(isLoading) ? 
            <Spinner className='mx-auto'/> : 
            <><Badge className="m-4 p-4">1.</Badge><p>Quote 2: {lorem}</p></>}</Stack>
        </Col>
      </Row>
      <Row>
        <Col>
          <Stack className="m-3 p-3 border rounded" direction='horizontal'>
            {(isLoading) ? 
            <Spinner className='mx-auto'/> : 
            <><Badge className="m-4 p-4">1.</Badge><p>Quote 3: {lorem}</p></>}</Stack>
        </Col>
        <Col>
          <Stack className="m-3 p-3 border rounded" direction='horizontal'>
            {(isLoading) ? 
            <Spinner className='mx-auto'/> : 
            <><Badge className="m-4 p-4">1.</Badge><p>Quote 4: {lorem}</p></>}</Stack>
        </Col>
      </Row>
    </Container>
  )
}
