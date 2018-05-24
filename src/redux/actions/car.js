import { carMakes, carModels } from '../../api';

export function getCarMakes() {
  return (dispatch) => {
    return new Promise((resolve, reject) => {
      carMakes()
      .then((res) => {
        var json = res._bodyInit.substring(2, res._bodyInit.length-2)
        resolve(JSON.parse(json).Makes)
      })
      .catch((err) => {
        console.log(err);
      });
    });
  };
}

export function getCarModels(make) {
  return (dispatch) => {
    return new Promise((resolve, reject) => {
      carModels(make)
      .then((res) => {
        var json = res._bodyInit.substring(2, res._bodyInit.length-2)
        resolve(JSON.parse(json).Models)
      })
      .catch((err) => {
        console.log(err);
      });
    });
  };
}