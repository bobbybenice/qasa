import React, { PureComponent } from 'react'
import { Proximity } from './';

const randomMessages = [{ value: "cool", received: true }, { value: "oh, really?", received: true }, { value: "woof!", received: true }];
const greetingMessages = [{ value: "hi buddy!", received: true }, { value: "hello!", received: true }, { value: "good day!", received: true }];
const responseMessages = [{ value: "im good, thanks!", received: true }, { value: "not too bad!", received: true }, { value: "today is a good day!", received: true }];

const greetings = ["hej", "hallå", "hello", "hey", "whats up", "yo", "hejsan", "tjabba", "tja", "tjena", "zup", "sup"];

export default class Phone extends PureComponent {
  constructor(props) {
    super(props);
    this.phoneAvatarRef = React.createRef();
    this.phoneInputRef = React.createRef();
    this.phoneBottomRef = React.createRef();
    this.textRef = React.createRef();
    this.state = {
      message: { value: "", received: false },
      messages: [],
      receivedMessages: [],
      typing: false,
    }
  }
  componentDidUpdate(prevProps, prevState) {
    const thisLength = this.state.messages.length;

    if (thisLength && !this.state.messages[thisLength - 1].received) {
      setTimeout(() => {
        this.addReceivedMessage();
      }, 1500);
    }
  }
  componentDidMount() {
    if (this.phoneInputRef && this.phoneInputRef.current) {
      this.phoneInputRef.current.focus();
    }
  }
  addReceivedMessage = () => {
    const isGreeting = greetings.includes(this.state.message.value);
    console.log(this.state);

    this.setState(prevState => {
      let newMessage = {};
      if (isGreeting) {
        newMessage = greetingMessages[Math.floor(Math.random() * greetingMessages.length)];
        console.log('yes');
      } else {
        newMessage = randomMessages[Math.floor(Math.random() * randomMessages.length)];
        console.log('no');
      }
      
      let includes = prevState.messages.includes(newMessage);
      let newMessages = includes ? [...prevState.messages] : [...prevState.messages, newMessage];

      return ({ messages: [...newMessages], message: { value: "", received: false }, typing: false });
    })
  }
  handleKeyDown = (e) => {
    if (e.keyCode === 13) {
      console.log('keydown');
      this.setState(prevState => {
        let msgs = [...prevState.messages];
        msgs.push(this.state.message);
        return ({ messages: msgs, typing: true })
      })
    }
  }
  handleChange = (e) => this.setState({ message: { value: e.target.value, received: false } });
  renderReceivedMessages = () => {
    return this.state.messages.map((message, i) => {
      return (
        <div key={i} className="received-message scale-in-bl">
          <span className="bubble"></span>
          <span className="text">{message.value}</span>
        </div>
      )
    });
  }
  renderMessages = () => {
    return this.state.messages.map(message => {
      return (
        <div className={message.received ? "received-message scale-in-bl" : "message scale-in-br"} key={message.value}>
          <span className="bubble"></span>
          <span className="text">{message.value}</span>
        </div>
      )
    });
  }
  render() {
    return (
      <div className="phone">
        <div className="speaker"></div>
        <p className="title">Say hi to Snoop!</p>
        <Proximity
          ref={this.phoneBottomRef}
          end={{ y: 0 }}
          animInterval={{ from: 0, to: -30 }}
          className="inner"
          parentClassName="outer"
          yoyo={false}
          type="y"
        >
          <div className="inner">

            <div className="top-bar">
              <span className="left-arrow"></span>
              <img className="avatar" src="https://images.unsplash.com/photo-1518717758536-85ae29035b6d?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=58321e04954daa3a0e2d3b1dc2a927da&auto=format&fit=crop&w=2250&q=80" alt="dog" />
            </div>

            <div className="messages">
              {this.renderMessages()}
              
              {this.state.typing && (
                <div className="writing-balls">
                  <span className="writing-ball ping"></span>
                  <span className="writing-ball ping"></span>
                  <span className="writing-ball ping"></span>
                </div>
              )}
            </div>
              <input
                ref={this.phoneInputRef}
                name="message"
                className="message-field"
                placeholder="Message"
                value={this.state.message.value}
                onKeyDown={(e) => this.handleKeyDown(e)}
                onChange={(e) => this.handleChange(e)}
              />
            <div className="home-bar"></div>
          </div>
        </Proximity>
      </div>
    )
  }
}
