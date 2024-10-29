"use client";

import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';

import { Fragment, useEffect, useState } from 'react';
import { Lobby, User } from '../types';
import { gameInfo } from '../games';
import {
  animation,
  combineObjects,
  deleteAnswers,
  deleteUsers,
  getDarkTheme,
  getAnswers,
  getLobby,
  getUsers,
  sleep,
  updateLobby,
  updateUser,
} from '../utils';

export default function Main() {
  const [checkUsers, setCheckUsers] = useState(false);
  const [showDescription, setShowDescription] = useState(true);
  const [initialising, setInitialising] = useState(false);
  const [initialised, setInitialised] = useState(false);
  const [localMessages, setLocalMessages] = useState<any>({});
  const [lobby, setLobby] = useState<Lobby>({
    name: 'the chiwa event',
    users: [],
    currentGame: '',
  });
  const [users, setUsers] = useState<User[]>([]);
  const [deletingUsers, setDeletingUsers] = useState<string[]>([]);
  const [guesser, setGuesser] = useState('');
  const [answerer, setAnswerer] = useState('');
  const [wolf, setWolf] = useState('');
  const [answers, setAnswers] = useState([]);

  const incrementUser = (name: string, key: string, diff: number) => {
    if (!initialised) return;
    let index: number = -1;
    users.forEach((user: User, i: number) => {
      if (user.name === name) index = i;
    });
    const newUsers = [...users];
    if (key === 'points') {
      newUsers[index]['points'] = (newUsers[index]['points'] || 0) + diff;
    } else if (key === 'wins') {
      newUsers[index]['wins'] = (newUsers[index]['wins'] || 0) + diff;
    } else if (key === 'losses') {
      newUsers[index]['losses'] = (newUsers[index]['losses'] || 0) + diff;
    }
    updateUser(newUsers[index].name, newUsers[index]).then(() => {
      setUsers(newUsers);
    });
  }

  const toggleActive = (name: string) => {
    if (!initialised) return;
    let index: number = -1;
    users.forEach((user: User, i: number) => {
      if (user.name === name) index = i;
    });
    const newUsers = [...users];
    newUsers[index]['active'] = !newUsers[index]['active'];
    updateUser(newUsers[index].name, newUsers[index]).then(() => {
      setUsers(newUsers);
    });
  }

  const toggleCheckUsers = () => {
    if (checkUsers) localStorage.removeItem('checkUsers');
    else localStorage.setItem('checkUsers', 'true');
    setCheckUsers(!checkUsers);
  }

  const addUser = (name: string) => {
    if (!initialised || lobby.users.includes(name)) return;
    const data = {
      users: lobby.users.concat([name])
    };
    updateLobby(lobby.name, data).then(() => {
      setLobby(combineObjects(lobby, data));
    });
  }

  const removeUser = (name: string) => {
    if (!initialised) return;
    const data = {
      users: lobby.users.filter(user => user !== name)
    };
    updateLobby(lobby.name, data).then(() => {
      setLobby(combineObjects(lobby, data));
    });
  }

  const deleteUser = (name: string) => {
    if (!deletingUsers.includes(name)) {
      setDeletingUsers(deletingUsers.concat([name]));
      setTimeout(() => {
        setDeletingUsers([]);
      }, 1500);
    } else {
      deleteUsers(name).then(() => {
        const newUsers: User[] = [];
        users.forEach(user => {
          if (user.name !== name) newUsers.push(user);
        })
        setUsers(newUsers);
      });
    }
  }

  async function watchUsers (delay: number = 2) {
    const check = localStorage.getItem('checkUsers');
    if (check) {
      getUsers().then(newUsers => {
        setUsers(newUsers);
        setInitialising(true);
        sleep(750).then(() => {
          setInitialised(true);
        });
      });
    }
    setTimeout(() => watchUsers(delay), delay * 1000);
  }

  async function startGame (name: string) {
    if (lobby.currentGame) return;
    const newLobby = {
      currentGame: name
    }
    updateLobby(lobby.name, newLobby).then(() => {
      setLobby(combineObjects(lobby, newLobby));
    });
  }

  async function endGame () {
    const newLobby = {
      currentGame: ''
    }
    updateLobby(lobby.name, newLobby).then(() => {
      setLobby(combineObjects(lobby, newLobby));
    });
  }

  async function clearLocalMessages () {
    setGuesser('');
    setAnswerer('');
    setWolf('');
    const def = ['', '', '', '', '', '', '', ''];
    const newLocalMessages = {global: localMessages['global'] || def}
    setLocalMessages(newLocalMessages);
  }

  async function copyGlobalLine (line: number, prefix: string = '', suffix: string = '') {
    let message = localMessages['global'] ? localMessages['global'][line - 1] : '';
    if (!message) return;
    message = `${prefix}${message}${suffix}`;
    const newLocalMessages: any = {};
    (lobby.users || []).forEach((name: string) => {
      const currentMessages = name in localMessages ? localMessages[name] : ['', '', ''];
      currentMessages[line - 1] = message;
      newLocalMessages[name] = currentMessages
    });
    setLocalMessages(combineObjects(localMessages, newLocalMessages));
  }

  async function hivemindMessage() {
    let message = localMessages['global'] ? localMessages['global'][3] : '';
    if (!message) return;
    const newLocalMessages: any = {};
    (lobby.users || []).forEach((name: string) => {
      const currentMessages = ['', '', ''];
      currentMessages[0] = 'the question is';
      currentMessages[1] = message;
      newLocalMessages[name] = currentMessages
    });
    setLocalMessages(combineObjects(localMessages, newLocalMessages));
  }

  async function charadesMessage() {
    let word = localMessages['global'] ? localMessages['global'][7] : '';
    console.log('charadesMessage()', word, answerer);
    if (!word || !answerer) return;
    const newLocalMessages: any = {};
    (lobby.users || []).forEach((name: string) => {
      const currentMessages = ['', '', ''];
      if (name === answerer) {
        currentMessages[0] = 'you are the actor';
        currentMessages[1] = 'your word is';
        currentMessages[2] = word;
      } else {
        currentMessages[0] = `${answerer} is the actor`;
        currentMessages[1] = ``;
        currentMessages[2] = ``;
      }
      newLocalMessages[name] = currentMessages
    });
    setLocalMessages(combineObjects(localMessages, newLocalMessages));
  }

  async function gimme5Message() {
    let word = localMessages['global'] ? localMessages['global'][6] : '';
    console.log('gimme5Message()', word, guesser, answerer);
    if (!word || !guesser || !answerer) return;
    const newLocalMessages: any = {};
    (lobby.users || []).forEach((name: string) => {
      const currentMessages = ['', '', ''];
      if (name === guesser) {
        currentMessages[0] = 'you are the guesser';
        currentMessages[1] = 'ask questions to figure out';
        currentMessages[2] = 'the mystery word';
      } else if (name === answerer) {
        currentMessages[0] = 'you are the answerer';
        currentMessages[1] = 'your word is';
        currentMessages[2] = word; 
      } else {
        currentMessages[0] = `${guesser} is the guesser`;
        currentMessages[1] = `${answerer} is the answerer`;
        currentMessages[2] = `the word is ${word}`;
      }
      newLocalMessages[name] = currentMessages
    });
    setLocalMessages(combineObjects(localMessages, newLocalMessages));
  }

  async function wordWolfMessage() {
    let word = localMessages['global'] ? localMessages['global'][4] : '';
    let wolfWord = localMessages['global'] ? localMessages['global'][5] : '';
    console.log('wordWolfMessage()', word, wolfWord, wolf);
    if (!word || !wolfWord || !wolf) return;
    const newLocalMessages: any = {};
    (lobby.users || []).forEach((name: string) => {
      const currentMessages = ['', '', ''];
      if (name !== wolf) {
        currentMessages[0] = 'you are not the wolf';
        currentMessages[1] = 'your word is';
        currentMessages[2] = word;
      } else {
        currentMessages[0] = 'you are the wolf';
        currentMessages[1] = 'your word is';
        currentMessages[2] = wolfWord;        
      }
      newLocalMessages[name] = currentMessages
    });
    setLocalMessages(combineObjects(localMessages, newLocalMessages));
  }

  async function clearHelper(name: string) {
    const def: any = name === 'global' ? ['', '', '', '', '', '', '', ''] : ['', '', ''];
    const newLocalMessages: any = {
      [name]: def
    };
    setLocalMessages(combineObjects(localMessages, newLocalMessages));
  }

  async function guesserHelper(name: string) {
    if (guesser === name) setGuesser('');
    else setGuesser(name);
  }

  async function answererHelper(name: string) {
    if (answerer === name) setAnswerer('');
    else setAnswerer(name);
  }

  async function wolfHelper(name: string) {
    if (wolf === name) setWolf('');
    else setWolf(name);
  }

  async function updateLocalMessages (name: string, message: string, line: number) {
    const def: any = name === 'global' ? ['', '', '', '', '', '', '', ''] : ['', '', ''];
    const currentMessages = name in localMessages ? localMessages[name] : def;
    currentMessages[line - 1] = message;
    const newLocalMessages = {[name]: currentMessages}
    setLocalMessages(combineObjects(localMessages, newLocalMessages));
  }

  async function sendMessages () {
    const newLobby = combineObjects(lobby, {messages: localMessages});
    updateLobby(lobby.name, newLobby);
    setLobby(newLobby);
  }

  async function answersGetHelper () {
    const data = await getAnswers();
    setAnswers(data);
  }

  async function answersDeleteHelper () {
    const data = await deleteAnswers();
    setAnswers([]);
  }

  useEffect(() => {}, []);

  const adminLanding = () => {
    return (
      <div className={`home-container${animation('flipInY')}`}>
        <span className={`home-header${initialising ? animation('backOutUp') : ''}`}>admin</span>
        <span className={`home-subheader`}></span>
        <TextField
          className={`home-user-input${initialising ? animation('backOutDown') : ''}`}
          label='lobby name'
          value={lobby.name || ''}
          onKeyDown={(event) => {
            if (lobby.name && event.key === 'Enter') {
              (event.target as HTMLElement).blur();
              toggleCheckUsers();
              watchUsers();
              getLobby().then(newLobby => {
                setLobby(combineObjects(lobby, newLobby));
              });
            }
          }}
          onChange={(event) => {
            const name = event.target.value;
            setLobby(combineObjects(lobby, { name }));
          }}
        />
      </div>
    )
  }

  const adminLeft = () => {
    return <Fragment>
      <div className={`users-container admin-module`}>
        <div className={`user-header-container`}>
          <span className={`user-header`}>users</span>
          <Checkbox
            className={`user-active-checkbox`}
            checked={checkUsers}
            onChange={() => toggleCheckUsers()}
            inputProps={{ 'aria-label': 'controlled' }}
            size="small"
          />
        </div>
        {[...users].sort((a: User, b: User) => a.name.localeCompare(b.name)).map((user: User) => 
          <div className={`user-container`} key={user.name}>
            <span className={`user-name`}>{user.name}</span>
            <div className={`user-active-container`}>
              <span className={`user-active`}>active</span>
              <Checkbox
                className={`user-active-checkbox`}
                checked={user.active}
                onChange={() => toggleActive(user.name)}
                inputProps={{ 'aria-label': 'controlled' }}
                size="small"
              />
            </div>
            <div className={`user-points-container`}>
              <span className={`user-points`}>points : {user.points || 0}</span>
              <Button className={`user-mini-button`} variant="outlined" onClick={() => incrementUser(user.name, 'points', -1)}>-</Button>
              <Button className={`user-mini-button`} variant="outlined" onClick={() => incrementUser(user.name, 'points', 1)}>+</Button>
            </div>
            <div className={`user-wins-container`}>
              <span className={`user-wins`}>wins : {user.wins || 0}</span>
              <Button className={`user-mini-button`} variant="outlined" onClick={() => incrementUser(user.name, 'wins', -1)}>-</Button>
              <Button className={`user-mini-button`} variant="outlined" onClick={() => incrementUser(user.name, 'wins', 1)}>+</Button>
            </div>
            <div className={`user-losses-container`}>
              <span className={`user-losses`}>losses : {user.losses || 0}</span>
              <Button className={`user-mini-button`} variant="outlined" onClick={() => incrementUser(user.name, 'losses', -1)}>-</Button>
              <Button className={`user-mini-button`} variant="outlined" onClick={() => incrementUser(user.name, 'losses', 1)}>+</Button>
            </div>
            {
              !lobby.users.includes(user.name) && <Fragment>
                <Button className={`user-button`} variant="outlined" onClick={() => addUser(user.name)}>add</Button>
                <Button className={`user-button`} variant="outlined" onClick={() => deleteUser(user.name)}>{deletingUsers.includes(user.name) ? 'are you sure?' : 'delete'}</Button>
              </Fragment>
            }
          </div>
        )}
      </div>
      <div className={`users-container admin-module`}>
        <span className={`user-header`}>lobby ({lobby.users.length}/{users.length})</span>
        {[...lobby.users].sort((a: string, b: string) => a.localeCompare(b)).map((user: string) => 
          <div className={`user-container`} key={user}>
            <span className={`user-name`}>{user}</span>
            <Button className={`user-button`} variant="outlined" onClick={() => removeUser(user)}>remove</Button>
          </div>
        )}
      </div>
    </Fragment>
  }

  const adminMiddle = () => {
    return <Fragment>
    <div className={`games-container admin-module`}>
      <span className={'games-header'}>games</span>
      {gameInfo.map((game: any) => 
          <div className={`user-container`} key={game.name}>
            <span className={`user-name`}>{game.name}</span>
            {
              lobby.currentGame !== game.name
              ? <Button className={`user-button`} variant="outlined" onClick={() => startGame(game.name)}>start</Button>
              : <Button className={`user-button`} variant="outlined" onClick={() => endGame()}>end</Button>
            }
            
          </div>
      )}
      {lobby.currentGame && (
        <div className={`controls-global-buttons`}>
          <Button className={`controls-global-button`} variant="outlined" onClick={() => clearLocalMessages() }>clear all</Button>
          <Button className={`controls-global-button`} variant="outlined" onClick={() => copyGlobalLine(1)}>line 1</Button>
          <Button className={`controls-global-button`} variant="outlined" onClick={() => copyGlobalLine(2)}>line 2</Button>
          <Button className={`controls-global-button`} variant="outlined" onClick={() => copyGlobalLine(3)}>line 3</Button>
          <Button className={`controls-global-button`} variant="outlined" onClick={() => hivemindMessage()}>hivemind</Button>
          <Button className={`controls-global-button`} variant="outlined" onClick={() => wordWolfMessage()}>word wolf</Button>
          <Button className={`controls-global-button`} variant="outlined" onClick={() => gimme5Message()}>gimme 5</Button>
          <Button className={`controls-global-button`} variant="outlined" onClick={() => charadesMessage()}>charades</Button>
          <Button className={`controls-global-button`} variant="outlined" onClick={() => sendMessages()}>send all</Button>
        </div>
      )}
    </div>
    </Fragment>
  }

  const adminRight = () => {
    let currentGame: any;
    gameInfo.forEach((game: any) => {
      if (lobby.currentGame && lobby.currentGame === game.name) {
        currentGame = game;
      }
    });
    if (!currentGame) currentGame = {};
    return <Fragment>
      <div className={`game-container admin-module`}>
        <span className={`game-header`}>
          current game: {currentGame.name || 'none'}
          <Button className={`user-mini-button`} variant="outlined" onClick={() => setShowDescription(!showDescription)}>{ showDescription ? '-' : '+' }</Button>
        </span>
        {currentGame.name && 
          <div className={`game-main`}>
            {showDescription && (
              <div className={`game-description`}>
                {(currentGame.description || []).map((line: string, index: number) => 
                  <span className={`game-description-line${animation('slideInRight')}`}>{line}</span>
                )}
              </div>
            )}
          </div>
        }
      </div>
      <div className={`controls-wrapper`}>
        <div className={`controls-container admin-module`}>
          <span className={`controls-header`}>local data</span>
          <div className={`controls-user controls-user--global`}>
            <span className={`controls-message-header`}>
              global
              <Button className={`controls-message-button`} variant="outlined" onClick={() => clearHelper('global')}>clear</Button>
            </span>
            <TextField
              className={`controls-message-line`}
              label='line 1'
              value={localMessages['global'] ? localMessages['global'][0] : ''}
              onChange={(event) => {
                const message = event.target.value;
                updateLocalMessages('global', message, 1);
              }}
            />
            <TextField
              className={`controls-message-line`}
              label='line 2'
              value={localMessages['global'] ? localMessages['global'][1] : ''}
              onChange={(event) => {
                const message = event.target.value;
                updateLocalMessages('global', message, 2);
              }}
            />
            <TextField
              className={`controls-message-line`}
              label='line 3'
              value={localMessages['global'] ? localMessages['global'][2] : ''}
              onChange={(event) => {
                const message = event.target.value;
                updateLocalMessages('global', message, 3);
              }}
            />
            <TextField
              className={`controls-message-line`}
              label='hivemind question'
              value={localMessages['global'] ? localMessages['global'][3] : ''}
              onChange={(event) => {
                const message = event.target.value;
                updateLocalMessages('global', message, 4);
              }}
            />
            <TextField
              className={`controls-message-line`}
              label='majority word'
              value={localMessages['global'] ? localMessages['global'][4] : ''}
              onChange={(event) => {
                const message = event.target.value;
                updateLocalMessages('global', message, 5);
              }}
            />
            <TextField
              className={`controls-message-line`}
              label='wolf word'
              value={localMessages['global'] ? localMessages['global'][5] : ''}
              onChange={(event) => {
                const message = event.target.value;
                updateLocalMessages('global', message, 6);
              }}
            />
            <TextField
              className={`controls-message-line`}
              label='gimme 5 word'
              value={localMessages['global'] ? localMessages['global'][6] : ''}
              onChange={(event) => {
                const message = event.target.value;
                updateLocalMessages('global', message, 7);
              }}
            />
            <TextField
              className={`controls-message-line`}
              label='charades word'
              value={localMessages['global'] ? localMessages['global'][7] : ''}
              onChange={(event) => {
                const message = event.target.value;
                updateLocalMessages('global', message, 8);
              }}
            />
            <div className={`controls-info-container`}>
              <span className={`controls-info`}>guesser: {guesser || 'none'}</span>
              <span className={`controls-info`}>answerer: {answerer || 'none'}</span>
              <span className={`controls-info`}>wolf: {wolf || 'none'}</span>
            </div>
          </div>
          
          {lobby.users && (
            <div className={`controls-users`}>
              {([...lobby.users].sort((a: string, b: string) => a.localeCompare(b)).map((name: string) => {
                let currentUser: User = {name : ''};
                users.forEach((user: User) => {
                  if (user.name === name) {
                    currentUser = user;
                  }
                });
                return <div className={`controls-user`} key={currentUser.name}>
                  <span className={`controls-message-header`}>
                    {currentUser.name}
                    <Button className={`controls-message-button`} variant="outlined" onClick={() => guesserHelper(currentUser.name)}>guesser</Button>
                    <Button className={`controls-message-button`} variant="outlined" onClick={() => answererHelper(currentUser.name)}>answerer</Button>
                    <Button className={`controls-message-button`} variant="outlined" onClick={() => wolfHelper(currentUser.name)}>wolf</Button>
              <Button className={`controls-message-button`} variant="outlined" onClick={() => clearHelper(currentUser.name)}>clear</Button>
                  </span>
                  <TextField
                    className={`controls-message-line`}
                    label='line 1'
                    value={localMessages[name] ? localMessages[name][0] : ''}
                    onChange={(event) => {
                      const message = event.target.value;
                      updateLocalMessages(name, message, 1);
                    }}
                  />
                  <TextField
                    className={`controls-message-line`}
                    label='line 2'
                    value={localMessages[name] ? localMessages[name][1] : ''}
                    onChange={(event) => {
                      const message = event.target.value;
                      updateLocalMessages(name, message, 2);
                    }}
                  />
                  <TextField
                    className={`controls-message-line`}
                    label='line 3'
                    value={localMessages[name] ? localMessages[name][2] : ''}
                    onChange={(event) => {
                      const message = event.target.value;
                      updateLocalMessages(name, message, 3);
                    }}
                  />
                </div>
              }))}
            </div>
            
          )}
        </div>
        <div className={`controls-container admin-module`}>
          <div className={`answers-container`}>
            <span className={`answers-header`}>
              answers
              <Button className={`controls-message-button`} variant="outlined" onClick={() => answersGetHelper()}>get</Button>
              <Button className={`controls-message-button`} variant="outlined" onClick={() => answersDeleteHelper()}>delete</Button>
              </span>
            {answers.map((answer: any) => {
              return <div className={`answers-answer`}>
                <span className={`answers-text`}>{answer.name}</span>
                <span className={`answers-text`}>{answer.message}</span>
              </div>
            })}
          </div>
          {lobby.users && (
            <div className={`controls-users`}>
              {([...lobby.users].sort((a: string, b: string) => a.localeCompare(b)).map((name: string) => {
                let currentUser: User = {name : ''};
                users.forEach((user: User) => {
                  if (user.name === name) {
                    currentUser = user;
                  }
                });
                const messages = lobby?.messages?.[currentUser.name] || ['', '', ''];
                return <div className={`controls-user`} key={currentUser.name}>
                  <span className={`controls-message-header`}>
                    {currentUser.name}
                  </span>
                  <TextField
                    className={`controls-message-line`}
                    value={messages[0] || ''}
                  />
                  <TextField
                    className={`controls-message-line`}
                    value={messages[1] || ''}
                  />
                  <TextField
                    className={`controls-message-line`}
                    value={messages[2] || ''}
                  />
                </div>
              }))}
            </div>
            
          )}
        </div>
      </div>
    </Fragment>
  }

  const adminPage = () => {
    return (
      <div className={`admin-container${animation('zoomIn')}`}>
        <span className={`admin-header`}>{lobby.name}</span>
        <div className={`admin-main`}>
          <div className={`admin-left`}>{adminLeft()}</div>
          <div className={`admin-middle`}>{adminMiddle()}</div>
          <div className={`admin-right`}>{adminRight()}</div>
        </div>
      </div>
    )
  }
  return (
    <ThemeProvider theme={getDarkTheme()}>
      <CssBaseline />
      <main>
        {!initialised ? adminLanding() : adminPage()}
      </main>
    </ThemeProvider>
  )
}
