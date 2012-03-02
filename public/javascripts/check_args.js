function validate_position(x, y) {
  if (x && y && typeof x == "number" && typeof y == "number") {
    return x >= 0 && x <= 850 && y>=0 && y<= 680;
  } else {
    return false;
  }
}

function validate_slideId(data) {
  if (data && data.slideId) {
    return true;
  } else {
    return false;
  }
}

function validate_slideNo(data) {
  if (data && typeof data.slideno == "number") {
    return data.slideno >= 0;
  } else {
    return false;
  }  
}

function validate_message(data) {
  return data && data.message;
}

function validate_id(data) {
  return data && data.id;
}

this['validate_position'] = validate_position;
this['validate_slideId'] = validate_slideId;
this['validate_slideNo'] = validate_slideNo;
this['validate_message'] = validate_message;
this['validate_id'] = validate_id;

