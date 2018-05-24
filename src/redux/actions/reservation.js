import * as types from '../types';
import { getReservationBySpotId, getReservations, getMyReservations, getRenterReservations } from '../../api';

// ACTIONS

export function GetReservations(spotId) {
  return (dispatch) => {
    return new Promise((resolve, reject) => {
      getReservationBySpotId(spotId)
        .then((res) => {
          res.json().then((json) => {
            resolve(json.reservations);
          })
        })
    })
  }
}

export const GetAllReservations = () => {
  return (dispatch) => {
    return new Promise((resolve, reject) => {
      getReservations()
        .then((res) => {
          res.json().then((json) => {
            resolve(json.reservations);
          })
        })
    })
  }
}

export const GetMyReservations = (username) => {
  return (dispatch) => {
    return new Promise((resolve, reject) => {
      getMyReservations(username)
        .then((res) => {
          res.json().then((json) => {
            resolve(json.reservations);
          })
        })
    })
  }
}

export const GetRenterReservations = (username) => {
  return (dispatch) => {
    return new Promise((resolve, reject) => {
      getRenterReservations(username)
        .then((res) => {
          res.json().then((json) => {
            resolve(json.reservations);
          })
        })
    })
  }
}