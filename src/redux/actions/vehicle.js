import { newVehicle, editVehicle, removeVehicle } from '../../api';
import * as RealmDB from '../realm';

// ACTIONS
export function addVehicle(username, make, model, plate, color, picture) {
  return (dispatch) => {
    return new Promise((resolve, reject) => {
      newVehicle(username, make, model, plate, color, picture)
      .then((res) => {
        res.json().then((json) => {
          if (json.success) {
            RealmDB.createVehicleItem(json.vehicle)
            resolve();
          } else {
            reject(json.msg);
          }
        });
      })
      .catch((err) => {
        console.log(err);
      });
    });
  };
}

export function updateVehicle(vehicleId, username, make, model, plate, color, picture) {
  return (dispatch) => {
    return new Promise((resolve, reject) => {
      editVehicle(vehicleId, username, make, model, plate, color, picture)
      .then((res) => {
        res.json().then((json) => {
          if (json.success) {
            RealmDB.updateVehicleItem(json.vehicle)
            resolve();
          } else {
            reject(json.msg);
          }
        });
      })
      .catch((err) => {
        console.log(err);
      });
    });
  };
}

export function deleteVehicle(id) {
  return (dispatch) => {
    return new Promise((resolve, reject) => {
      removeVehicle(id)
      .then((res) => {
        res.json().then((json) => {
          if (json.success) {
            RealmDB.deleteVehicleItem(id)
            resolve();
          } else {
            reject(json.msg);
          }
        });
      })
      .catch((err) => {
        console.log(err);
      });
    });
  };
}