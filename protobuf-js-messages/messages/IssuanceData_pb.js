/**
 * @fileoverview
 * @enhanceable
 * @suppress {messageConventions} JS Compiler reports an error if a variable or
 *     field starts with 'MSG_' and isn't a translatable message.
 * @public
 */
// GENERATED CODE -- DO NOT EDIT!

var jspb = require('google-protobuf');
var goog = jspb;
var global = Function('return this')();

var SolidityTypes_pb = require('./SolidityTypes_pb.js');
goog.object.extend(proto, SolidityTypes_pb);
var SupplementalLineItem_pb = require('./SupplementalLineItem_pb.js');
goog.object.extend(proto, SupplementalLineItem_pb);
goog.exportSymbol('proto.IssuanceProperties', null, global);
goog.exportSymbol('proto.IssuanceProperties.State', null, global);
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.IssuanceProperties = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.IssuanceProperties.repeatedFields_, null);
};
goog.inherits(proto.IssuanceProperties, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.IssuanceProperties.displayName = 'proto.IssuanceProperties';
}

/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.IssuanceProperties.repeatedFields_ = [11];



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.IssuanceProperties.prototype.toObject = function(opt_includeInstance) {
  return proto.IssuanceProperties.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.IssuanceProperties} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.IssuanceProperties.toObject = function(includeInstance, msg) {
  var f, obj = {
    issuanceid: (f = msg.getIssuanceid()) && SolidityTypes_pb.uint256.toObject(includeInstance, f),
    makeraddress: (f = msg.getMakeraddress()) && SolidityTypes_pb.address.toObject(includeInstance, f),
    takeraddress: (f = msg.getTakeraddress()) && SolidityTypes_pb.address.toObject(includeInstance, f),
    engagementduetimestamp: (f = msg.getEngagementduetimestamp()) && SolidityTypes_pb.uint256.toObject(includeInstance, f),
    issuanceduetimestamp: (f = msg.getIssuanceduetimestamp()) && SolidityTypes_pb.uint256.toObject(includeInstance, f),
    creationtimestamp: (f = msg.getCreationtimestamp()) && SolidityTypes_pb.uint256.toObject(includeInstance, f),
    engagementtimestamp: (f = msg.getEngagementtimestamp()) && SolidityTypes_pb.uint256.toObject(includeInstance, f),
    settlementtimestamp: (f = msg.getSettlementtimestamp()) && SolidityTypes_pb.uint256.toObject(includeInstance, f),
    issuanceescrowaddress: (f = msg.getIssuanceescrowaddress()) && SolidityTypes_pb.address.toObject(includeInstance, f),
    state: jspb.Message.getFieldWithDefault(msg, 10, 0),
    supplementallineitemsList: jspb.Message.toObjectList(msg.getSupplementallineitemsList(),
    SupplementalLineItem_pb.SupplementalLineItem.toObject, includeInstance)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.IssuanceProperties}
 */
proto.IssuanceProperties.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.IssuanceProperties;
  return proto.IssuanceProperties.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.IssuanceProperties} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.IssuanceProperties}
 */
proto.IssuanceProperties.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new SolidityTypes_pb.uint256;
      reader.readMessage(value,SolidityTypes_pb.uint256.deserializeBinaryFromReader);
      msg.setIssuanceid(value);
      break;
    case 2:
      var value = new SolidityTypes_pb.address;
      reader.readMessage(value,SolidityTypes_pb.address.deserializeBinaryFromReader);
      msg.setMakeraddress(value);
      break;
    case 3:
      var value = new SolidityTypes_pb.address;
      reader.readMessage(value,SolidityTypes_pb.address.deserializeBinaryFromReader);
      msg.setTakeraddress(value);
      break;
    case 4:
      var value = new SolidityTypes_pb.uint256;
      reader.readMessage(value,SolidityTypes_pb.uint256.deserializeBinaryFromReader);
      msg.setEngagementduetimestamp(value);
      break;
    case 5:
      var value = new SolidityTypes_pb.uint256;
      reader.readMessage(value,SolidityTypes_pb.uint256.deserializeBinaryFromReader);
      msg.setIssuanceduetimestamp(value);
      break;
    case 6:
      var value = new SolidityTypes_pb.uint256;
      reader.readMessage(value,SolidityTypes_pb.uint256.deserializeBinaryFromReader);
      msg.setCreationtimestamp(value);
      break;
    case 7:
      var value = new SolidityTypes_pb.uint256;
      reader.readMessage(value,SolidityTypes_pb.uint256.deserializeBinaryFromReader);
      msg.setEngagementtimestamp(value);
      break;
    case 8:
      var value = new SolidityTypes_pb.uint256;
      reader.readMessage(value,SolidityTypes_pb.uint256.deserializeBinaryFromReader);
      msg.setSettlementtimestamp(value);
      break;
    case 9:
      var value = new SolidityTypes_pb.address;
      reader.readMessage(value,SolidityTypes_pb.address.deserializeBinaryFromReader);
      msg.setIssuanceescrowaddress(value);
      break;
    case 10:
      var value = /** @type {!proto.IssuanceProperties.State} */ (reader.readEnum());
      msg.setState(value);
      break;
    case 11:
      var value = new SupplementalLineItem_pb.SupplementalLineItem;
      reader.readMessage(value,SupplementalLineItem_pb.SupplementalLineItem.deserializeBinaryFromReader);
      msg.addSupplementallineitems(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.IssuanceProperties.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.IssuanceProperties.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.IssuanceProperties} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.IssuanceProperties.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getIssuanceid();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      SolidityTypes_pb.uint256.serializeBinaryToWriter
    );
  }
  f = message.getMakeraddress();
  if (f != null) {
    writer.writeMessage(
      2,
      f,
      SolidityTypes_pb.address.serializeBinaryToWriter
    );
  }
  f = message.getTakeraddress();
  if (f != null) {
    writer.writeMessage(
      3,
      f,
      SolidityTypes_pb.address.serializeBinaryToWriter
    );
  }
  f = message.getEngagementduetimestamp();
  if (f != null) {
    writer.writeMessage(
      4,
      f,
      SolidityTypes_pb.uint256.serializeBinaryToWriter
    );
  }
  f = message.getIssuanceduetimestamp();
  if (f != null) {
    writer.writeMessage(
      5,
      f,
      SolidityTypes_pb.uint256.serializeBinaryToWriter
    );
  }
  f = message.getCreationtimestamp();
  if (f != null) {
    writer.writeMessage(
      6,
      f,
      SolidityTypes_pb.uint256.serializeBinaryToWriter
    );
  }
  f = message.getEngagementtimestamp();
  if (f != null) {
    writer.writeMessage(
      7,
      f,
      SolidityTypes_pb.uint256.serializeBinaryToWriter
    );
  }
  f = message.getSettlementtimestamp();
  if (f != null) {
    writer.writeMessage(
      8,
      f,
      SolidityTypes_pb.uint256.serializeBinaryToWriter
    );
  }
  f = message.getIssuanceescrowaddress();
  if (f != null) {
    writer.writeMessage(
      9,
      f,
      SolidityTypes_pb.address.serializeBinaryToWriter
    );
  }
  f = message.getState();
  if (f !== 0.0) {
    writer.writeEnum(
      10,
      f
    );
  }
  f = message.getSupplementallineitemsList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      11,
      f,
      SupplementalLineItem_pb.SupplementalLineItem.serializeBinaryToWriter
    );
  }
};


/**
 * @enum {number}
 */
proto.IssuanceProperties.State = {
  UNKNOWN: 0,
  INITIATED: 1,
  ENGAGEABLE: 2,
  ENGAGED: 3,
  UNFUNDED: 4,
  CANCELLED: 5,
  COMPLETENOTENGAGED: 6,
  COMPLETEENGAGED: 7,
  DELINQUENT: 8
};

/**
 * optional solidity.uint256 issuanceId = 1;
 * @return {?proto.solidity.uint256}
 */
proto.IssuanceProperties.prototype.getIssuanceid = function() {
  return /** @type{?proto.solidity.uint256} */ (
    jspb.Message.getWrapperField(this, SolidityTypes_pb.uint256, 1));
};


/** @param {?proto.solidity.uint256|undefined} value */
proto.IssuanceProperties.prototype.setIssuanceid = function(value) {
  jspb.Message.setWrapperField(this, 1, value);
};


/**
 * Clears the message field making it undefined.
 */
proto.IssuanceProperties.prototype.clearIssuanceid = function() {
  this.setIssuanceid(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.IssuanceProperties.prototype.hasIssuanceid = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional solidity.address makerAddress = 2;
 * @return {?proto.solidity.address}
 */
proto.IssuanceProperties.prototype.getMakeraddress = function() {
  return /** @type{?proto.solidity.address} */ (
    jspb.Message.getWrapperField(this, SolidityTypes_pb.address, 2));
};


/** @param {?proto.solidity.address|undefined} value */
proto.IssuanceProperties.prototype.setMakeraddress = function(value) {
  jspb.Message.setWrapperField(this, 2, value);
};


/**
 * Clears the message field making it undefined.
 */
proto.IssuanceProperties.prototype.clearMakeraddress = function() {
  this.setMakeraddress(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.IssuanceProperties.prototype.hasMakeraddress = function() {
  return jspb.Message.getField(this, 2) != null;
};


/**
 * optional solidity.address takerAddress = 3;
 * @return {?proto.solidity.address}
 */
proto.IssuanceProperties.prototype.getTakeraddress = function() {
  return /** @type{?proto.solidity.address} */ (
    jspb.Message.getWrapperField(this, SolidityTypes_pb.address, 3));
};


/** @param {?proto.solidity.address|undefined} value */
proto.IssuanceProperties.prototype.setTakeraddress = function(value) {
  jspb.Message.setWrapperField(this, 3, value);
};


/**
 * Clears the message field making it undefined.
 */
proto.IssuanceProperties.prototype.clearTakeraddress = function() {
  this.setTakeraddress(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.IssuanceProperties.prototype.hasTakeraddress = function() {
  return jspb.Message.getField(this, 3) != null;
};


/**
 * optional solidity.uint256 engagementDueTimestamp = 4;
 * @return {?proto.solidity.uint256}
 */
proto.IssuanceProperties.prototype.getEngagementduetimestamp = function() {
  return /** @type{?proto.solidity.uint256} */ (
    jspb.Message.getWrapperField(this, SolidityTypes_pb.uint256, 4));
};


/** @param {?proto.solidity.uint256|undefined} value */
proto.IssuanceProperties.prototype.setEngagementduetimestamp = function(value) {
  jspb.Message.setWrapperField(this, 4, value);
};


/**
 * Clears the message field making it undefined.
 */
proto.IssuanceProperties.prototype.clearEngagementduetimestamp = function() {
  this.setEngagementduetimestamp(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.IssuanceProperties.prototype.hasEngagementduetimestamp = function() {
  return jspb.Message.getField(this, 4) != null;
};


/**
 * optional solidity.uint256 issuanceDueTimestamp = 5;
 * @return {?proto.solidity.uint256}
 */
proto.IssuanceProperties.prototype.getIssuanceduetimestamp = function() {
  return /** @type{?proto.solidity.uint256} */ (
    jspb.Message.getWrapperField(this, SolidityTypes_pb.uint256, 5));
};


/** @param {?proto.solidity.uint256|undefined} value */
proto.IssuanceProperties.prototype.setIssuanceduetimestamp = function(value) {
  jspb.Message.setWrapperField(this, 5, value);
};


/**
 * Clears the message field making it undefined.
 */
proto.IssuanceProperties.prototype.clearIssuanceduetimestamp = function() {
  this.setIssuanceduetimestamp(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.IssuanceProperties.prototype.hasIssuanceduetimestamp = function() {
  return jspb.Message.getField(this, 5) != null;
};


/**
 * optional solidity.uint256 creationTimestamp = 6;
 * @return {?proto.solidity.uint256}
 */
proto.IssuanceProperties.prototype.getCreationtimestamp = function() {
  return /** @type{?proto.solidity.uint256} */ (
    jspb.Message.getWrapperField(this, SolidityTypes_pb.uint256, 6));
};


/** @param {?proto.solidity.uint256|undefined} value */
proto.IssuanceProperties.prototype.setCreationtimestamp = function(value) {
  jspb.Message.setWrapperField(this, 6, value);
};


/**
 * Clears the message field making it undefined.
 */
proto.IssuanceProperties.prototype.clearCreationtimestamp = function() {
  this.setCreationtimestamp(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.IssuanceProperties.prototype.hasCreationtimestamp = function() {
  return jspb.Message.getField(this, 6) != null;
};


/**
 * optional solidity.uint256 engagementTimestamp = 7;
 * @return {?proto.solidity.uint256}
 */
proto.IssuanceProperties.prototype.getEngagementtimestamp = function() {
  return /** @type{?proto.solidity.uint256} */ (
    jspb.Message.getWrapperField(this, SolidityTypes_pb.uint256, 7));
};


/** @param {?proto.solidity.uint256|undefined} value */
proto.IssuanceProperties.prototype.setEngagementtimestamp = function(value) {
  jspb.Message.setWrapperField(this, 7, value);
};


/**
 * Clears the message field making it undefined.
 */
proto.IssuanceProperties.prototype.clearEngagementtimestamp = function() {
  this.setEngagementtimestamp(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.IssuanceProperties.prototype.hasEngagementtimestamp = function() {
  return jspb.Message.getField(this, 7) != null;
};


/**
 * optional solidity.uint256 settlementTimestamp = 8;
 * @return {?proto.solidity.uint256}
 */
proto.IssuanceProperties.prototype.getSettlementtimestamp = function() {
  return /** @type{?proto.solidity.uint256} */ (
    jspb.Message.getWrapperField(this, SolidityTypes_pb.uint256, 8));
};


/** @param {?proto.solidity.uint256|undefined} value */
proto.IssuanceProperties.prototype.setSettlementtimestamp = function(value) {
  jspb.Message.setWrapperField(this, 8, value);
};


/**
 * Clears the message field making it undefined.
 */
proto.IssuanceProperties.prototype.clearSettlementtimestamp = function() {
  this.setSettlementtimestamp(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.IssuanceProperties.prototype.hasSettlementtimestamp = function() {
  return jspb.Message.getField(this, 8) != null;
};


/**
 * optional solidity.address issuanceEscrowAddress = 9;
 * @return {?proto.solidity.address}
 */
proto.IssuanceProperties.prototype.getIssuanceescrowaddress = function() {
  return /** @type{?proto.solidity.address} */ (
    jspb.Message.getWrapperField(this, SolidityTypes_pb.address, 9));
};


/** @param {?proto.solidity.address|undefined} value */
proto.IssuanceProperties.prototype.setIssuanceescrowaddress = function(value) {
  jspb.Message.setWrapperField(this, 9, value);
};


/**
 * Clears the message field making it undefined.
 */
proto.IssuanceProperties.prototype.clearIssuanceescrowaddress = function() {
  this.setIssuanceescrowaddress(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.IssuanceProperties.prototype.hasIssuanceescrowaddress = function() {
  return jspb.Message.getField(this, 9) != null;
};


/**
 * optional State state = 10;
 * @return {!proto.IssuanceProperties.State}
 */
proto.IssuanceProperties.prototype.getState = function() {
  return /** @type {!proto.IssuanceProperties.State} */ (jspb.Message.getFieldWithDefault(this, 10, 0));
};


/** @param {!proto.IssuanceProperties.State} value */
proto.IssuanceProperties.prototype.setState = function(value) {
  jspb.Message.setProto3EnumField(this, 10, value);
};


/**
 * repeated SupplementalLineItem supplementalLineItems = 11;
 * @return {!Array<!proto.SupplementalLineItem>}
 */
proto.IssuanceProperties.prototype.getSupplementallineitemsList = function() {
  return /** @type{!Array<!proto.SupplementalLineItem>} */ (
    jspb.Message.getRepeatedWrapperField(this, SupplementalLineItem_pb.SupplementalLineItem, 11));
};


/** @param {!Array<!proto.SupplementalLineItem>} value */
proto.IssuanceProperties.prototype.setSupplementallineitemsList = function(value) {
  jspb.Message.setRepeatedWrapperField(this, 11, value);
};


/**
 * @param {!proto.SupplementalLineItem=} opt_value
 * @param {number=} opt_index
 * @return {!proto.SupplementalLineItem}
 */
proto.IssuanceProperties.prototype.addSupplementallineitems = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 11, opt_value, proto.SupplementalLineItem, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 */
proto.IssuanceProperties.prototype.clearSupplementallineitemsList = function() {
  this.setSupplementallineitemsList([]);
};


goog.object.extend(exports, proto);
