import React, { Component } from 'react';
import { Container } from 'reactstrap';
import { NavMenu } from './NavMenu';

export class Layout extends Component {
  static displayName = Layout.name;

  render() {
    return (
      <div tag="main">
        <Container fluid className='p-0'>
          {this.props.children}
        </Container>
      </div>
    );
  }
}
