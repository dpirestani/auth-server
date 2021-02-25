function keepCloning(objectpassed) {
    if (objectpassed === null || typeof objectpassed !== 'object') {
       return objectpassed;
    }
  // give temporary-storage the original obj's constructor
  var temporarystorage = objectpassed.constructor(); 
    for (var key in objectpassed) {
        console.log("Key----",key,"objectpassed", objectpassed)
      temporarystorage[key] = keepCloning(objectpassed[key]);
    }
    return temporarystorage;
  }
  
  
  var employeeDetailsOriginal = {x:1, b:[{c:1},{d:1}]}
  var employeeDetailsDuplicate = (keepCloning(employeeDetailsOriginal));
  employeeDetailsOriginal.a = 2 ;
  console.log(employeeDetailsOriginal);
  console.log(employeeDetailsDuplicate);