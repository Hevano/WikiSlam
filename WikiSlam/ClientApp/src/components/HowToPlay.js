import React from 'react'
import { Card, Stack, Container, Row, Col } from 'react-bootstrap'
import InspectImage from "../assets/Wikislam-inspect.webp";
import RankImage from "../assets/Wikislam-rank.webp";
import RollImage from "../assets/Wikislam-roll.webp";

export default function HowToPlay() {
  return (
    <Stack gap={4}>
    <Card className='w-100 h-auto'>
      <Container fluid><Row>
      <Col md={8} sm={12}>
      <Card.Body>
        <Card.Title className="fs-2">Roll For A Wikipedia article</Card.Title>
        <Card.Text>
          Each wikipedia article is ranked by three factors: Strength, Dexterity, and Willpower. 
          Strength is based on the length of the article. 
          Dexterity is based on the number of categories the article falls under.
          Willpower is based on the number of citations the article uses.
          <span className='text-body-secondary'> Pro tip: spending some time to roll for an article with high base stats will improve your chances of winning.</span>
        </Card.Text>
      </Card.Body>
      </Col>
      <Col md={2} sm={6}>
      <Card.Img className='img-fluid'  variant="top" src={RollImage} />
      </Col>
      </Row></Container>
    </Card>
    <Card className='w-100 h-auto'>
      <Container fluid><Row>
      <Col md={2} sm={6}>
      <Card.Img className='img-fluid' variant="top" src={InspectImage} />
      </Col>
      <Col md={8} sm={12}>
      <Card.Body>
        <Card.Title className="fs-2">Identify The Quotes</Card.Title>
        <Card.Text>
          Once you have an article, you will be given 4 quotes. 
          One of these quotes has been pulled from your article, and the rest have been pulled randomly from other articles across wikipedia.
          Picking the quote from your article will <span className='text-info'>LEVEL UP</span> your article, but guessing wrong will cause your article to <span className='text-danger'>LEVEL DOWN</span>.
        </Card.Text>
      </Card.Body>
      </Col>
      </Row></Container>
    </Card>
    <Card className='w-100 h-auto'>
      <Container fluid><Row>
      <Col md={8} sm={12}>
        <Card.Body>
          <Card.Title className="fs-2">Outrank Your Opponents</Card.Title>
          <Card.Text>
            Your article's strength, dexterity, and willpower increase when it levels up. 
            At the end of the 2 minute round, everyone's articles are ranked based on these stats.
            The person with the highest ranked article is declared the  <span className='text-success'>WINNER</span>.
          </Card.Text>
        </Card.Body>
      </Col>
      <Col md={2} sm={2}>
        <Card.Img className='img-fluid' src={RankImage} />
      </Col>
      </Row></Container>
    </Card>
    </Stack>
  )
}


