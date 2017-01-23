import React from 'react'
import './App.css'

class YoutubeVideo extends React.Component {

  render() {
    return (
      <div className="row">
        <div className="col-md-6">
        <h1 className="side-text-title">Esse é o título </h1>
        <div className="side-text-container">
          <span className="description-text">Esse texto explica Esse texto explica
          Esse texto explica
          Esse texto explica Esse texto explica um pouco
          Esse texto explica Esse texto explica</span>
        </div>
        <button className="btn btn-default pascoa-button">SOU UM CAÇADOR > </button>
        <button className="btn btn-default pascoa-button">SOU UM LOJISTA > </button>
        </div>
        <div className="col-md-6">
          <iframe className="video-container" src="https://www.youtube.com/embed/uCW7qfzYJYk" frameBorder="0" allowFullScreen></iframe>
        </div>
      </div>
    )
  }
}

export default YoutubeVideo
