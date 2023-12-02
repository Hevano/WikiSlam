import React from 'react'
import { Card, Stack } from 'react-bootstrap'

export default function HowToPlay() {
  return (
    <Stack gap={4}>
    <Card className='w-100 h-auto'>
      <Stack direction="horizontal">
      <Card.Body>
        <Card.Title className="fs-2">Roll For A Wikipedia article</Card.Title>
        <Card.Text>
          Each wikipedia article is ranked by four factors: Strength, Dexterity, and Willpower. 
          Strength is based on the length of the article. 
          Dexterity is based on the number of categories the article falls under.
          Willpower is based on the number of citations the article uses.
          <span className='text-body-secondary'> Pro tip: spending some time to roll for a article with high base stats will improve your chances of winning.</span>
        </Card.Text>
      </Card.Body>
      <Card.Img className='m-3' style={{height: "16rem", width: "auto"}} variant="top" src="https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png" />
      </Stack>
    </Card>
    <Card className='w-100 h-auto'>
      <Stack direction="horizontal">
      <Card.Img className='m-3' style={{height: "16rem", width: "auto"}} variant="top" src="https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png" />
      <Card.Body>
        <Card.Title className="fs-2">Answer Trivia Questions</Card.Title>
        <Card.Text>
          Once you have an article, you will be given 4 quotes. 
          One of these quotes has been pulled from your article, and the rest have been pulled randomly from other articles across wikipedia.
          Picking the quote from your article will <span className='text-info'>LEVEL UP</span> your article, but guessing wrong will casue a <span className='text-danger'>LEVEL DOWN</span>.
        </Card.Text>
      </Card.Body>
      </Stack>
    </Card>
    <Card className='w-100 h-auto'>
      <Stack direction="horizontal">
      <Card.Body>
        <Card.Title className="fs-2">Outrank Your Opponents</Card.Title>
        <Card.Text>
          Your articles strength, dexterity, and willpower increase when it levels up. 
          At the end of the 2 minute round, everyone's articles are ranked based on these stats.
          The person with the highest ranked article is declared the  <span className='text-success'>WINNER</span>.
        </Card.Text>
      </Card.Body>
      <Card.Img style={{height: "16rem", width: "auto"}} variant="top" src="https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png" />
      </Stack>
    </Card>
    </Stack>
  )
}
