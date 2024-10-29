import { createTheme } from '@mui/material/styles';
import axios from 'axios';

export const animation = (name: string, delay: number = 0) => {
    let str = ` animate__animated animate__${name}`;
    if (delay) str += ` animate__delay-${delay}s`
    return str;
}

export const combineObjects = (obj1: any, obj2: any) => {
  return Object.assign({}, obj1, obj2);
}

export const getDarkTheme = () => {
    return createTheme({
        palette: {
            mode: 'dark',
        },
    });
}

export const sleep = (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function updatePage(
    classFunc: Function,
    pageFunc: Function,
    page: string,
    callback?: Function
) {
    classFunc(animation('slideOutDown'));
    await sleep(500);
    classFunc(animation('slideInDown'));
    pageFunc(page);
    if (!callback) return;
    callback();
}

export async function login(name: string) {
    const user = (await axios.get(`/api/users?name=${name}`)).data || {};
    if (user.active) return { error: 'already logged in, ask chiwa for help' };
    await axios.post('/api/users', { name, active: true });
    return {};
}

export async function createAnswer(name: string, message: string, game: string, question: string = '') {
    const data: any = { name, message, game, question};
    await axios.post('/api/answers', data);
}

export async function getAnswers() {
  const users = (await axios.get('/api/answers')).data;
  return users;
}

export async function deleteAnswers() {
  await axios.delete('/api/answers');
}

export async function getUsers() {
  const users = (await axios.get('/api/users')).data;
  return users;
}

export async function updateUser(name: string, data: object) {
    const lobby = (await axios.put(`/api/users?name=${name}`, data)).data.res;
    return lobby;
}

export async function deleteUsers(name: string) {
    await axios.delete(`/api/users?name=${name}`);
}

export async function getLobby() {
  const lobby = (await axios.get('/api/lobbies?name=the chiwa event')).data;
  return lobby;
}

export async function updateLobby(name: string, data: any) {
    const lobby = (await axios.put(`/api/lobbies?name=${name}`, data)).data.res;
    return lobby;
}

export async function api_call(
    method: string,
    url: string,
    body: object | {},
    callback: Function | null
) {
    const config: any = { method, url };
    if (method === 'post' && body) config['data'] = body;
    axios(config).then(() => {
        if (callback) callback();
    });
}

export const simplifyHelper: any = (obj: any) => {
    const new_obj = JSON.parse(JSON.stringify(obj));
    if ('createdAt' in new_obj) delete new_obj['createdAt'];
    if ('updatedAt' in new_obj) delete new_obj['updatedAt'];
    if ('id' in new_obj) delete new_obj['id'];
    return new_obj;
}

export const simplify: any = (obj: any) => {
    if (obj.length) {
        const arr = [];
        for (let i = 0; i < obj.length; i++) {
            arr.push(simplify(obj[i]));
        }
        return arr;
    }
    return obj ? simplifyHelper(obj) : obj;
}
