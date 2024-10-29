"use client";

import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';

import { Fragment, useEffect, useState } from 'react';
import { Lobby, PageMap, User } from './types';
import {
  animation,
  combineObjects,
  createAnswer,
  getDarkTheme,
  getLobby,
  login,
  updatePage,
} from './utils';
import { gameInfo } from './games';

export default function Main() {
  const [message, setMessage] = useState('');
  const [mainClass, setMainClass] = useState('');
  const [watching, setWatching] = useState(false);
  const [page, setPage] = useState<string>('home');
  const [answer, setAnswer] = useState<string>('')
  const [user, setUser] = useState<User>({
    name: '',
  });
  const [lobby, setLobby] = useState<Lobby>({
    name: '',
    users: [],
    currentGame: '',
  });

  const updateUser = (name: string) => {
    if (name.length > 20) return;
    setUser(combineObjects(user, {'name': name}));
  }

  async function watchLobby (delay: number) {
    if (!watching || lobby.currentGame) return;
    getLobby().then(newLobby => {
      setLobby(combineObjects(lobby, newLobby));
    });
    setTimeout(() => watching && watchLobby(delay), delay * 1000);
  }

  async function submitAnswer() {
    const name = user.name;
    const message = answer;
    const game = lobby.currentGame;
    const question = (lobby?.messages?.[name] || ['']).join(' ');
    createAnswer(name, message, game, question);
  }

  useEffect(() => {
    if (page === 'home') {
      const name = localStorage.getItem('user');
      if (name) setUser(u => combineObjects(u, {'name': name}));
    } else if (page === 'lobby') {
      watchLobby(1);
    }
  }, [page]);

  useEffect(() => {}, []);

  const homePage = (delay: number = 0) => {
    return (
      <div className={`home-container`}>
        <span className={`home-header${animation('slideInLeft')}`}>welcome</span>
        <span className={`home-subheader${animation('fadeInUp', 1)}`}>to the chiwa event</span>
        <TextField
          className={`home-user-input${animation('bounceIn', 2)}`}
          label='name'
          value={user.name || ''}
          onKeyDown={(event) => {
            if (user.name && event.key === 'Enter') {
              setMessage('');
              if (user.name === 'global') {
                setMessage('invalid name');
                return;
              }
              login(user.name).then((res: any) => {
                if ('error' in res) {
                  setMessage(res.error);
                } else {
                  (event.target as HTMLElement).blur();
                  setWatching(true);
                  updatePage(setMainClass, setPage, 'lobby', () => {
                    localStorage.setItem('user', user.name);
                  });
                }
              });
            }
          }}
          onChange={(event) => {
            updateUser(event.target.value);
          }}
        />
        {message && (
          <span className={`home-message${animation('headShake')}`}>{message}</span>
        )}
      </div>
    )
  }

  const userContainer = (users: any) => {
    return users.length === 0 ? <Fragment/> : <div className={`users-wrapper`}>
      <div className={`users-container`}>
      <span className={`users-header`}>players</span>
        {[...users].sort((a: string, b: string) => a.localeCompare(b)).map((name: any) => 
          <span className={`user-name`} key={name}>{name}</span>
        )}
      </div>
    </div>
  }

  const lobbyPage = (delay: number = 0) => {
    const gameStarted = !!lobby.currentGame;
    let currentGame: any;
    gameInfo.forEach((game: any) => {
      if (lobby.currentGame && lobby.currentGame === game.name) {
        currentGame = game;
      }
    });
    if (!currentGame) currentGame = {};
    let messages;
    if (lobby.messages && lobby.messages[user.name]) {
      messages = lobby.messages[user.name];
    }
    return (
      <Fragment>
        {!gameStarted ? (
          <div className={`lobby-container`}>
            <span className={`home-header`}>lobby</span>
            <span className={`home-subheader`}>hi {user.name}</span>
            <span className={`waiting`}>waiting for a game to start</span>
            {userContainer(lobby.users)}
          </div>
        ) : (
          <Fragment>
            <div className={`lobby-container${animation('tada')}`}>
              <span className={`home-header`}>{lobby.currentGame}</span>
              {!messages ? (
                <div className={`game-description`}>
                  {(currentGame.description || []).map((line: string, index: number) => 
                    <span className={`game-description-line${animation('slideInRight', index)}`} key={`line${index}`}>{line}</span>
                  )}
                </div>
              ) : (
                <div className={`game-message-container${animation('slideInUp')}`}>
                  {(messages || []).map((line: string, index: number) => 
                    <span className={`game-message-line`} key={`line${index}`}>{line}</span>
                  )}
                  {['hivemind', 'word wolf'].includes(currentGame.name) && (
                    <Fragment>
                      <TextField
                        className={`game-input`}
                        label='answer'
                        value={answer|| ''}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            setMessage('answer submitted');
                            submitAnswer();
                          }
                        }}
                        onChange={(event) => {
                          setAnswer(event.target.value);
                        }}
                      />
                      {message && (
                        <span className={`home-message${animation('headShake')}`}>{message}</span>
                      )}
                    </Fragment>
                  )}
                </div>
              )}
            </div>
            {userContainer(lobby.users)}
          </Fragment>
        )}
      </Fragment>
    )
  }

  const pages: PageMap = {
    'home': homePage(),
    'lobby': lobbyPage(2),
  }

  return (
    <ThemeProvider theme={getDarkTheme()}>
      <CssBaseline />
      <main className={mainClass}>
        {pages[page]}
      </main>
    </ThemeProvider>
  )
}
