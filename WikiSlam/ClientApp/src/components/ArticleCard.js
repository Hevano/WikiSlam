import React from 'react'
import { Card, Badge, Stack, Placeholder } from 'react-bootstrap'
import LevelBadge from './LevelBadge'

export default function ArticleCard({article, articleLoading, strRef, dexRef, wilRef, showLevel, children}) {
  return (
    <Card className='p-5' style={{height:"50vh"}}>
      {children}
      {showLevel && <div style={{position: "absolute", top: "40%", left: "-3em"}}><LevelBadge size={3} isLoading={articleLoading} article={article}/></div>}
      <Card.Body>
        {(articleLoading) ? <Placeholder as={Card.Title} animation="glow" className="m-1"><Placeholder xs={12} /></Placeholder> : <Card.Title className="text-center">{article.title}</Card.Title>}
        <div className='d-flex'><Card.Img className="mx-auto" style={{"objectFit": "contain", width: "16em", height: "16em"}} src={(!articleLoading && article.image) ? article.image : "https://placehold.co/600x400?text=Loading"} /></div>
        <Card.Text>
          <div className='mx-auto text-center'>{(articleLoading) ? "" : article.desc}</div>
          <Stack direction='horizontal'>
            <Badge ref={strRef}className='mx-auto mt-4 fs-5'>STR: {(!articleLoading) ? article.strength : "???"}</Badge>
            <Badge ref={dexRef} className='mx-auto mt-4 fs-5'>DEX: {(!articleLoading) ? article.dexterity : "???"}</Badge>
            <Badge ref={wilRef} className='mx-auto mt-4 fs-5'>WIL: {(!articleLoading) ? article.willpower : "???"}</Badge>
          </Stack>
        </Card.Text>
      </Card.Body>
    </Card>
  )
}
