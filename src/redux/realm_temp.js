import Realm from 'realm';

// /////////////////////////////////////////////////////////////////// Job List
// Item
class JobListItem {
  static get() {
    return realm.objects('JobListItem');
  }
  static schema = {
    name: "JobListItem",
    primaryKey: "job_id",
    properties: {
      job_id: {
        type: "int"
      },
      hotel_name: {
        type: "string"
      },
      job_type_name: {
        type: "string"
      },
      slot: {
        type: "int"
      },
      current_slot: {
        type: "int"
      },
      start_time: {
        type: "string"
      },
      end_time: {
        type: "string"
      },
      start_date: {
        type: "string"
      },
      timestamp: {
        type: "string"
      }
    }
  };
}

export const saveJobListItems = (items) => {
  items
    .forEach(function (element) {
      createJobListItem(element);
    }, this);
}

export const getJobListItemsByDate = () => {
  todayDate = '';
  currentTime = '';
  const now = new Date();

  let hh = '' + now.getHours();
  let mm = '' + now.getMinutes();
  if (hh.length == 1) {
    hh = '0' + hh;
  }
  if (mm.length == 1) {
    mm = '0' + mm;
  }
  currentTime = hh + ':' + mm;

  let yyyy = now.getFullYear();
  let mo = String(now.getMonth() + 1);
  let dd = String(now.getDate());
  if (mo.length == 1) {
    mo = '0' + mo;
  }
  if (dd.length == 1) {
    dd = '0' + dd;
  }
  todayDate = yyyy + '-' + mo + '-' + dd;
  currentTime = hh + ":" + mm;

  //alert( todayDate + ' ' + currentTime );

  const items = JobListItem
    .get()
    .sorted("start_date", false);

  for (let index = 0; index < items.length;) {
    const element = items[index];
    if (element.start_date < todayDate) {
      deleteJobListItem(element);
      index--;
    } else if (element.start_date === todayDate && element.start_time < currentTime) {
      deleteJobListItem(element);
      index--;
    }
    index++;
  }

  return items;
}

export const getJobListItemsByHotel = () => {
  let items = JobListItem
    .get()
    .slice();
  items.sort((a, b) => {
    if (a.hotel_name < b.hotel_name) {
      return false;
    } else if (a.hotel_name === b.hotel_name) {
      return a.start_date > b.start_date;
    }
    return true;
  });
  return items;
}

export const getJobListItem = (job_id) => {
  const item = realm.objectForPrimaryKey(JobListItem, job_id);
  return item;
}

export const updateJobListItem = (item, timestamp) => {
  realm.write(() => {
    try {
      item.timestamp = timestamp;
    } catch (e) {
      console.warn(e);
    }
  });
}

export const createJobListItem = (element) => {

  const item = getJobListItem(element.job_id);
  if (item !== undefined) {
    return;
  }
  console.log("---create job list item---");
  realm.write(() => {
    realm.create(JobListItem.schema.name, {
      job_id: element.job_id,
      hotel_name: element.hotel_name,
      job_type_name: element.job_type_name,
      slot: element.slot,
      current_slot: element.current_slot,
      start_date: element.start_date,
      start_time: element.start_time,
      end_time: element.end_time,
      timestamp: element.timestamp
    });
  });
}

export const deleteJobListItem = (item) => {
  realm.write(() => {
    realm.delete(item);
  });
}
// ///////////////////////////////////////////////////////////////////
// ///////////////////////////////////////////////////////////////////
// ConfirmedJob Item
class ConfirmedJobItem {
  static get() {
    return realm.objects("ConfirmedJobItem");
  }
  static schema = {
    name: "ConfirmedJobItem",
    primaryKey: "job_id",
    properties: {
      job_id: {
        type: "int"
      },
      hotel_name: {
        type: "string"
      },
      job_type_name: {
        type: "string"
      },
      slot: {
        type: "int"
      },
      current_slot: {
        type: "int"
      },
      start_time: {
        type: "string"
      },
      end_time: {
        type: "string"
      },
      start_date: {
        type: "string"
      },
      timestamp: {
        type: "string"
      }
    }
  };
}

export const getConfirmedJobItems = () => {
  const items = ConfirmedJobItem
    .get()
    .sorted('start_date', true)
    .sorted('start_date', false);
  return items;
}

export const getConfirmedJobItem = (job_id) => {
  const item = realm.objectForPrimaryKey(ConfirmedJobItem, job_id);
  return item;
}

export const updateConfirmedJobItem = (item, timestamp) => {
  realm.write(() => {
    try {
      item.timestamp = timestamp;
    } catch (e) {
      console.warn(e);
    }
  });
}

export const createConfirmedJobItem = (job) => {

  const item = getConfirmedJobItem(job.job_id);
  if (item !== undefined) {
    return;
  }

  realm.write(() => {
    realm.create(ConfirmedJobItem.schema.name, {
      job_id: job.job_id,
      hotel_name: job.hotel_name,
      job_type_name: job.job_type_name,
      start_time: job.start_time,
      slot: job.slot,
      current_slot: job.current_slot,
      end_time: job.end_time,
      start_date: job.start_date,
      timestamp: job.timestamp
    });
  });
}

export const deleteConfirmedJobItem = item => {
  realm.write(() => {
    realm.delete(item);
  });
};
// ///////////////////////////////////////////////////////////////////
// ///////////////////////////////////////////////////////////////////
// PendingJobItem
class PendingJobItem {
  static get() {
    return realm.objects("PendingJobItem");
  }
  static schema = {
    name: "PendingJobItem",
    primaryKey: "job_id",
    properties: {
      job_id: {
        type: "int"
      },
      hotel_name: {
        type: "string"
      },
      job_type_name: {
        type: "string"
      },
      slot: {
        type: "int"
      },
      current_slot: {
        type: "int"
      },
      start_time: {
        type: "string"
      },
      end_time: {
        type: "string"
      },
      start_date: {
        type: "string"
      },
      timestamp: {
        type: "string"
      }
    }
  };
}

export const getPendingJobItems = () => {
  const items = PendingJobItem
    .get()
    .sorted('timestamp', true);
  return items;
}

export const getPendingJobItem = (job_id) => {
  const item = realm.objectForPrimaryKey(PendingJobItem, job_id);
  return item;
}

export const updatePendingJobItem = (item, timestamp) => {
  realm.write(() => {
    try {
      item.timestamp = timestamp;
    } catch (e) {
      console.warn(e);
    }
  });
}

export const createPendingJobItem = (job) => {

  const item = getPendingJobItem(job.job_id);
  if (item !== undefined) {
    return;
  }
  console.log('---create pending job item---');
  realm.write(() => {
    realm.create(PendingJobItem.schema.name, {
      job_id: job.job_id,
      hotel_name: job.hotel_name,
      job_type_name: job.job_type_name,
      start_time: job.start_time,
      slot: job.slot,
      current_slot: job.current_slot,
      end_time: job.end_time,
      start_date: job.start_date,
      timestamp: job.timestamp
    });
  });
}

export const deletePendingJobItem = item => {
  realm.write(() => {
    realm.delete(item);
  });
};
// ///////////////////////////////////////////////////////////////////
// ///////////////////////////////////////////////////////////////////
// FailedJobItem
class FailedJobItem {
  static get() {
    return realm.objects("FailedJobItem");
  }
  static schema = {
    name: "FailedJobItem",
    primaryKey: "job_id",
    properties: {
      job_id: {
        type: "int"
      },
      hotel_name: {
        type: "string"
      },
      job_type_name: {
        type: "string"
      },
      slot: {
        type: "int"
      },
      current_slot: {
        type: "int"
      },
      start_time: {
        type: "string"
      },
      end_time: {
        type: "string"
      },
      start_date: {
        type: "string"
      },
      timestamp: {
        type: "string"
      }
    }
  };
}

export const getFailedJobItems = () => {
  const items = FailedJobItem
    .get()
    .sorted('timestamp', true);
  return items;
}

export const getFailedJobItem = (job_id) => {
  const item = realm.objectForPrimaryKey(FailedJobItem, job_id);
  return item;
}

export const updateFailedJobItem = (item, timestamp) => {
  realm.write(() => {
    try {
      item.timestamp = timestamp;
    } catch (e) {
      console.warn(e);
    }
  });
}

export const createFailedJobItem = (job) => {
  const item = getFailedJobItem(job.job_id);
  if (item !== undefined) {
    return;
  }
  console.log("---create failed job item---");
  realm.write(() => {
    realm.create(FailedJobItem.schema.name, {
      job_id: job.job_id,
      hotel_name: job.hotel_name,
      job_type_name: job.job_type_name,
      start_time: job.start_time,
      end_time: job.end_time,
      start_date: job.start_date,
      timestamp: job.timestamp,
      slot: job.slot,
      current_slot: job.current_slot
    });
  });
}

export const deleteFailedJobItem = item => {
  realm.write(() => {
    realm.delete(item);
  });
}
// ///////////////////////////////////////////////////////////////////
// ///////////////////////////////////////////////////////////////////
// CompletedJobItem
class CompletedJobItem {
  static get() {
    return realm.objects("CompletedJobItem");
  }
  static schema = {
    name: "CompletedJobItem",
    primaryKey: "job_id",
    properties: {
      job_id: {
        type: "int"
      },
      hotel_name: {
        type: "string"
      },
      job_type_name: {
        type: "string"
      },
      slot: {
        type: "int"
      },
      current_slot: {
        type: "int"
      },
      start_time: {
        type: "string"
      },
      end_time: {
        type: "string"
      },
      start_date: {
        type: "string"
      },
      workTime_confirmed: {
        type: "bool"
      },
      real_start: {
        type: "string"
      },
      real_end: {
        type: "string"
      },
      timestamp: {
        type: "string"
      }
    }
  };
}

export const getCompletedJobItems = () => {
  const items = CompletedJobItem
    .get()
    .slice();
  items.sort((a, b) => {
    if (a.workTime_confirmed === b.workTime_confirmed) {
      return a.start_date > b.start_date;
    }
    return a.workTime_confirmed === true && b.workTime_confirmed === false;
  });
  return items;
}

export const getCompletedJobItem = (job_id) => {
  const item = realm.objectForPrimaryKey(CompletedJobItem, job_id);
  return item;
}

export const updateCompletedJobItemRealStart = (item, real_start) => {
  realm.write(() => {
    try {
      item.real_start = real_start;
    } catch (e) {
      console.warn(e);
    }
  });
}

export const updateCompletedJobItemRealEnd = (item, real_end) => {
  realm.write(() => {
    try {
      item.real_end = real_end;
    } catch (e) {
      console.warn(e);
    }
  });
}

export const createCompletedJobItem = (job) => {

  const item = getCompletedJobItem(job.job_id);
  if (item !== undefined) {
    return;
  }
  console.log("---create completed job item---");
  realm.write(() => {
    realm.create(CompletedJobItem.schema.name, {
      job_id: job.job_id,
      hotel_name: job.hotel_name,
      job_type_name: job.job_type_name,
      start_time: job.start_time,
      slot: job.slot,
      current_slot: job.current_slot,
      end_time: job.end_time,
      start_date: job.start_date,
      timestamp: job.timestamp,
      workTime_confirmed: job.workTime_confirmed,
      real_start: job.real_start,
      real_end: job.real_end
    });
  });
}

export const getUnconfirmedWorkTimeJobsCount = () => {
  return CompletedJobItem
    .get()
    .filtered("workTime_confirmed == false")
    .length;
}

export const deleteCompletedJobItem = item => {
  realm.write(() => {
    realm.delete(item);
  });
}
// ///////////////////////////////////////////////////////////////////
// ///////////////////////////////////////////////////////////////////
// Notification Item
class NotificationItem {
  static get() {
    return realm.objects("NotificationItem");
  }
  static schema = {
    name: "NotificationItem",
    primaryKey: "id",
    properties: {
      id: {
        type: "int"
      },
      type: {
        type: "string"
      }, // attire, joblist, completed, confirmed, failed,
      comment: {
        type: "string"
      }
    }
  };
}

export const getNotificationItems = () => {
  const items = NotificationItem
    .get('NotificationItem')
    .sorted('id', true);
  return items;
}

export const getNotificationItem = (id) => {
  const item = realm.objectForPrimaryKey(NotificationItem, id);
  return item;
}

export const createNotificationItem = (noti) => {
  const item = getNotificationItem(noti.id);
  console.log('----create notification item----');
  if (item !== undefined) {
    return;
  }
  realm.write(() => {
    console.log('----Notification Created------');
    realm.create(NotificationItem.schema.name, {
      id: noti.id,
      type: noti.type,
      comment: noti.comment
    });
  });

}

export const deleteNotificationItem = (item) => {
  realm.write(() => {
    realm.delete(item);
  });
}
/////////////////////////////////////////////////////////////////////

export const removeAll = () => {
  realm.write(() => {
    realm.deleteAll();
  });

}

////////////////////////////////////////
export const saveBookingJobs = (items) => {
  items['pending']
    .forEach(function (element) {
      createPendingJobItem(element);
    }, this);
  items['confirmed'].forEach(function (element) {
    createConfirmedJobItem(element);
  }, this);
  items['failed'].forEach(function (element) {
    createFailedJobItem(element);
  }, this);
  items['completed'].forEach(function (element) {
    createCompletedJobItem(element);
  }, this);
}

export const bookJob = (job_id) => {
  console.log('bookjob');
  const job = getJobListItem(job_id);
  if (job === undefined) {
    return;
  }
  createPendingJobItem(job);
  deleteJobListItem(job);
}

export const cancelJob = (job_id) => {
  let job = getPendingJobItem(job_id);

  if (job !== undefined) {
    createJobListItem(job);
    deletePendingJobItem(job);
    return;
  }
  job = getConfirmedJobItem(job_id);

  if (job === undefined) {
    return;
  }

  realm.write(() => {
    try {
      job.current_slot = job.current_slot - 1;
    } catch (e) {
      console.warn(e);
    }
  });
  createJobListItem(job);
  deleteConfirmedJobItem(job);
}

export const changeCurrentSlotValue = (job_id, current_slot_delta) => {
  let item = getJobListItem(job_id);
  if (item === undefined) {
    item = getPendingJobItem(job_id);
  }
  if (item === undefined) {
    item = getFailedJobItem(job_id);
  }
  if (item === undefined) {
    item = getConfirmedJobItem(job_id);
  }
  if (item === undefined) {
    return;
  }
  realm.write(() => {
    try {
      item.current_slot = item.current_slot + current_slot_delta;
    } catch (e) {
      console.warn(e);
    }
  });
}

export const confirmJob = (job_id) => {
  let item = getPendingJobItem(job_id);
  if (item === undefined) {
    return;
  }
  realm.write(() => {
    try {
      item.current_slot = item.current_slot + 1;
    } catch (e) {
      console.warn(e);
    }
  });

  createConfirmedJobItem(item);
  deletePendingJobItem(item);
}

export const failJob = (job_id) => {
  let item = getPendingJobItem(job_id);
  if (item === undefined) {
    return;
  }
  createFailedJobItem(item);
  deletePendingJobItem(item);
}

export const justPast = (job_id) => {
  let item = getConfirmedJobItem(job_id);
  if (item === undefined) {
    item = getJobListItem(job_id);

    if (item === undefined) {
      item = getPendingJobItem(job_id);
      if (item !== undefined) {
        deletePendingJobItem(item);
      }
      return;
    }

    deleteJobListItem(item);

    return;
  }

  realm.write(() => {
    try {
      item.workTime_confirmed = false;
      item.real_start = item.real_start;
      item.real_end = item.real_end;
    } catch (e) {
      console.warn(e);
    }
  });

  createCompletedJobItem(item);
  deleteConfirmedJobItem(item);
}

export const saveUpdatedJob = job => {
  const job_id = job.job_id;
  let item = getJobListItem(job_id);
  if (item === undefined) {
    item = getPendingJobItem(job_id);
  }
  if (item === undefined) {
    item = getFailedJobItem(job_id);
  }
  if (item === undefined) {
    item = getConfirmedJobItem(job_id);
  }
  if (item === undefined) {
    return;
  }
  realm.write(() => {
    try {
      item.slot = job.slot;
      item.start_date = job.start_date;
      item.start_time = job.start_time;
      item.end_time = job.end_time;
      item.timestamp = job.timestamp;
    } catch (e) {
      console.warn(e);
    }
  });
}

export const saveNotification = payload => {
  console.log('----------Notification-Received--------------');
  console.log(payload);

  var milliseconds = new Date().getTime();
  const msgType = payload.additionalData.msgType;
  let type;

  let noti;

  if (msgType === 0) {
    type = "slot";
    noti = {
      comment: payload.body,
      id: parseInt(payload.additionalData.timeStamp),
      type: type
    };
    // changeCurrentSlotValue(payload.additionalData.job_id,
    // payload.additionalData.current_slot_delta);
  } else if (msgType === 1) {
    type = "jobList";
    /*const newJobs = payload.additionalData.jobs;
        let timeStamp;
        newJobs.forEach(function(element) {
            createJobListItem(element);
            timeStamp = element.timestamp;
        }, this);
        */
    noti = {
      comment: payload.body,
      id: parseInt(payload.additionalData.timeStamp),
      type: type
    };
  } else if (msgType === 2) {
    type = "attire";
    noti = {
      comment: payload.body,
      id: parseInt(payload.additionalData.timeStamp),
      type: type
    };
  } else if (msgType === 3) {
    type = "confirmed";
    noti = {
      comment: payload.body,
      id: parseInt(payload.additionalData.timeStamp),
      type: type
    };
    //confirmJob( payload.additionalData.job_id );
  } else if (msgType === 4) {
    type = "failed";
    noti = {
      comment: payload.body,
      id: parseInt(payload.additionalData.timeStamp),
      type: type
    };
    //failJob(payload.additionalData.job_id);
  } else if (msgType === 5) {
    type = "worktime";
    noti = {
      comment: payload.body,
      id: parseInt(payload.additionalData.timeStamp),
      type: type
    };
    //justPast(payload.additionalData.job_id);
  } else if (msgType === 6) {
    type = "user state changed";
    noti = {
      comment: payload.body,
      id: parseInt(payload.additionalData.timeStamp),
      type: type
    };
  } else if (msgType === 7) {
    type = "job updated";
    noti = {
      comment: payload.body,
      id: parseInt(payload.additionalData.timeStamp),
      type: type
    };
    //saveUpdatedJob( payload.additionalData.job );
  } else if (msgType === 8) {
    return;
  } else if (msgType === 9) {
    type = "Admin Cancelled Your Job";
    noti = {
      comment: payload.body,
      id: parseInt(payload.additionalData.timeStamp),
      type: type
    };
    //cancelJob(payload.additionalData.job_id);
  } else if (msgType === 10) {
    type = "Admin Add You To Job";
    noti = {
      comment: payload.body,
      id: parseInt(payload.additionalData.timeStamp),
      type: type
    };
    // bookJob( payload.additionalData.job_id ); confirmJob(
    // payload.additionalData.job_id );
  } else if (msgType === 11) {
    type = "Your User Info Updated";
    noti = {
      comment: payload.body,
      id: parseInt(payload.additionalData.timeStamp),
      type: type
    };
  }

  createNotificationItem(noti);
}

export const getNewNotificationCount = visitTimeStamp => {
  if (visitTimeStamp === undefined || visitTimeStamp === '') {
    return 0;
  }
  const current = parseInt(visitTimeStamp);
  return getNotificationItems()
    .filtered("id > $0", current)
    .length;
}

export const getLatestNotificationTimeStamp = () => {
  return getNotificationItems()[0].id;
}

export const confirmWorkTime = element => {
  let item = getCompletedJobItem(element.job_id);
  realm.write(() => {
    try {
      item.real_start = element.real_start;
      item.real_end = element.real_end;
      item.workTime_confirmed = true;
    } catch (e) {
      console.warn(e);
    }
  });
}

export const updateJobListingsSlots = jobs => {

  console.log("---updateJobListingsSlots");
  let j = 0;
  const currentJobs = getJobListItemsByDate();
  for (let index = 0; index < currentJobs.length;) {
    const element = currentJobs[index];
    j = 0;
    for (j = 0; j < jobs.length; j++) {
      if (element.job_id === jobs[j].job_id) {
        break;
      }
    }
    if (j === jobs.length) {
      deleteJobListItem(element);
      index--;
    }
    index++;
  }

  for (j = 0; j < jobs.length; j++) {
    createJobListItem(jobs[j]);
  }

  jobs
    .forEach(function (element) {
      let item = getJobListItem(element.job_id);
      if (item !== undefined && item.job_id !== element.job_id) {
        realm.write(() => {
          try {
            item.current_slot = element.current_slot;
          } catch (e) {
            console.warn(e);
          }
        });
      }
    }, this);
}

export const updateMyBookinsSlots = jobs => {
  console.log("---updateMyBookinsSlots----");
  let j = 0;
  // check pending
  let items = getPendingJobItems();
  for (let index = 0; index < items.length;) {
    const element = items[index];
    j = 0;
    for (j = 0; j < jobs.pending.length; j++) {
      if (element.job_id === jobs.pending[j].job_id) {
        break;
      }
    }
    if (j === jobs.pending.length) {
      deletePendingJobItem(element);
      index--;
    }
    index++;
  }
  for (j = 0; j < jobs.pending.length; j++) {
    createPendingJobItem(jobs.pending[j]);
  }
  // check confirmed
  items = getConfirmedJobItems();
  for (let index = 0; index < items.length;) {
    const element = items[index];
    j = 0;
    for (j = 0; j < jobs.confirmed.length; j++) {
      if (element.job_id === jobs.confirmed[j].job_id) {
        break;
      }
    }
    if (j === jobs.confirmed.length) {
      deleteConfirmedJobItem(element);
      index--;
    }
    index++;
  }
  for (j = 0; j < jobs.confirmed.length; j++) {
    createConfirmedJobItem(jobs.confirmed[j]);
  }
  // check failed
  items = getFailedJobItems();
  for (let index = 0; index < items.length;) {
    const element = items[index];
    j = 0;
    for (j = 0; j < jobs.failed.length; j++) {
      if (element.job_id === jobs.failed[j].job_id) {
        break;
      }
    }
    if (j === jobs.failed.length) {
      deleteFailedJobItem(element);
      index--;
    }
    index++;
  }
  for (j = 0; j < jobs.failed.length; j++) {
    createFailedJobItem(jobs.failed[j]);
  }
  // check completed
  items = getCompletedJobItems();
  for (let index = 0; index < items.length;) {
    const element = items[index];
    j = 0;
    for (j = 0; j < jobs.completed.length; j++) {
      if (element.job_id === jobs.completed[j].job_id) {
        break;
      }
    }
    if (j === jobs.completed.length) {
      deleteCompletedJobItem(element);
      index--;
    }
    index++;
  }
  for (j = 0; j < jobs.completed.length; j++) {
    createCompletedJobItem(jobs.completed[j]);
  }
}

// Create Realm DB
export const realm = new Realm({
  schema: [
    JobListItem,
    PendingJobItem,
    ConfirmedJobItem,
    FailedJobItem,
    CompletedJobItem,
    NotificationItem
  ]
})