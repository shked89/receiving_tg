
const log = (data) => {
   console.log("log(): " + data);
   return true
}

log.e = (data) => {
   console.error("log_e(): " + data);
   return false
}

log.critical = (data) => {
   console.log("log_critical(): " + data);
   return false
}

module.exports = log