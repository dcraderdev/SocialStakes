//users

export const SET_USER = 'session/SET_USER';
export const REMOVE_USER = 'session/REMOVE_USER';
export const GET_USERS = 'users/GET_USERS';
export const SET_THEMES = 'users/SET_THEMES';
export const CHANGE_TABLE_THEME = 'users/CHANGE_TABLE_THEME';
export const CHANGE_NEON_THEME = 'users/CHANGE_NEON_THEME';


//csrf
export const SET_CSRF_TOKEN = 'set/SET_CSRF_TOKEN';


//game
export const GET_GAMES = 'games/GET_GAMES';
export const GET_TABLES = 'game/GET_ACTIVE_TABLES';
export const GET_GAME_BY_ID = 'games/GET_TABLE_BY_ID';
export const GET_TABLE_BY_ID = 'games/GET_TABLE_BY_ID';
export const GET_TABLES_BY_TYPE = 'games/GET_TABLES_BY_TYPE';

export const ADD_BALANCE = 'games/ADD_BALANCE';
export const ADD_BET = 'games/ADD_BET';
export const REMOVE_LAST_BET = 'games/REMOVE_LAST_BET';
export const REMOVE_ALL_BET = 'games/REMOVE_ALL_BET';

export const PLAYER_DISCONNECT = 'games/PLAYER_DISCONNECT';
export const PLAYER_RECONNECT = 'games/PLAYER_RECONNECT';
export const REMOVE_PLAYER = 'games/REMOVE_PLAYER';


export const PLAYER_ADD_TABLE_FUNDS = 'games/PLAYER_ADD_TABLE_FUNDS';


export const UPDATE_TABLE_COUNTDOWN = 'games/START_TABLE_COUNTDOWN';
export const COLLECT_BETS = 'games/COLLECT_BETS';
export const OFFER_INSURANCE = 'games/OFFER_INSURANCE';
export const RESCIND_INSURANCE = 'games/RESCIND_INSURANCE';





export const CREATE_TABLE = 'game/CREATE_TABLE';
export const DELETE_TABLE = 'game/DELETE_TABLE';
export const UPDATE_TABLE = 'game/UPDATE_TABLE';
export const UPDATE_TABLE_NAME = 'game/UPDATE_TABLE_NAME';
export const VIEW_TABLE = 'game/VIEW_TABLE';
export const JOIN_TABLE = 'game/JOIN_TABLE';
export const LEAVE_TABLE = 'game/LEAVE_TABLE';

export const LEAVE_SEAT = 'game/LEAVE_SEAT';
export const TAKE_SEAT = 'game/TAKE_SEAT';
export const CHANGE_SEAT = 'game/CHANGE_SEAT';
export const FORFEIT_SEAT = 'game/FORFEIT_SEAT';




export const SHOW_GAMES = 'game/SHOW_GAMES';
export const SHOW_TABLES = 'game/SHOW_TABLES';
export const SHOW_ACTIVE_TABLES = 'game/SHOW_ACTIVE_TABLES';
export const SHOW_CREATING_GAME = 'game/SHOW_CREATING_GAME'


export const ADD_MESSAGE = 'game/ADD_MESSAGE';
export const EDIT_MESSAGE = 'game/EDIT_MESSAGE';
export const DELETE_MESSAGE = 'game/DELETE_MESSAGE';
export const TOGGLE_SHOW_MESSAGES = 'game/TOGGLE_SHOW_MESSAGES';

