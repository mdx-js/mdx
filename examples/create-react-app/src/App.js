import React, { Component } from 'react'
/* eslint-disable import/no-webpack-loader-syntax */
import Content, { frontMatter } from '!babel-loader!mdx-loader!./Content.mdx'
 
class App extends Component {

  render() {
    return (
      <div>
        <h1>{frontMatter.title}</h1>
        <Content />
        <h3>Table of Contents</h3>
      </div>
    );
  }
}

export default App;
