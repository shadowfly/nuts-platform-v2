pragma solidity 0.5.16;
import "./ProtoBufRuntime.sol";
import "./SupplementalLineItem.sol";

library IssuanceProperties {

  //enum definition
// Solidity enum definitions
enum State {
    Unknown,
    Initiated,
    Engageable,
    Engaged,
    Unfunded,
    Cancelled,
    CompleteNotEngaged,
    CompleteEngaged,
    Delinquent
  }


// Solidity enum encoder
function encode_State(State x) internal pure returns (int64) {
    
  if (x == State.Unknown) {
    return 0;
  }

  if (x == State.Initiated) {
    return 1;
  }

  if (x == State.Engageable) {
    return 2;
  }

  if (x == State.Engaged) {
    return 3;
  }

  if (x == State.Unfunded) {
    return 4;
  }

  if (x == State.Cancelled) {
    return 5;
  }

  if (x == State.CompleteNotEngaged) {
    return 6;
  }

  if (x == State.CompleteEngaged) {
    return 7;
  }

  if (x == State.Delinquent) {
    return 8;
  }
  revert();
}


// Solidity enum decoder
function decode_State(int64 x) internal pure returns (State) {
    
  if (x == 0) {
    return State.Unknown;
  }

  if (x == 1) {
    return State.Initiated;
  }

  if (x == 2) {
    return State.Engageable;
  }

  if (x == 3) {
    return State.Engaged;
  }

  if (x == 4) {
    return State.Unfunded;
  }

  if (x == 5) {
    return State.Cancelled;
  }

  if (x == 6) {
    return State.CompleteNotEngaged;
  }

  if (x == 7) {
    return State.CompleteEngaged;
  }

  if (x == 8) {
    return State.Delinquent;
  }
  revert();
}


  //struct definition
  struct Data {
    uint256 issuanceId;
    address makerAddress;
    address takerAddress;
    uint256 engagementDueTimestamp;
    uint256 issuanceDueTimestamp;
    uint256 creationTimestamp;
    uint256 engagementTimestamp;
    uint256 settlementTimestamp;
    address issuanceProxyAddress;
    address issuanceEscrowAddress;
    IssuanceProperties.State state;
    SupplementalLineItem.Data[] supplementalLineItems;
  }

  // Decoder section

  /**
   * @dev The main decoder for memory
   * @param bs The bytes array to be decoded
   * @return The decoded struct
   */
  function decode(bytes memory bs) internal pure returns (Data memory) {
    (Data memory x, ) = _decode(32, bs, bs.length);
    return x;
  }

  /**
   * @dev The main decoder for storage
   * @param self The in-storage struct
   * @param bs The bytes array to be decoded
   */
  function decode(Data storage self, bytes memory bs) internal {
    (Data memory x, ) = _decode(32, bs, bs.length);
    store(x, self);
  }
  // inner decoder

  /**
   * @dev The decoder for internal usage
   * @param p The offset of bytes array to start decode
   * @param bs The bytes array to be decoded
   * @param sz The number of bytes expected
   * @return The decoded struct
   * @return The number of bytes decoded
   */
  function _decode(uint256 p, bytes memory bs, uint256 sz)
    internal 
    pure 
    returns (Data memory, uint) 
  {
    Data memory r;
    uint[13] memory counters;
    uint256 fieldId;
    ProtoBufRuntime.WireType wireType;
    uint256 bytesRead;
    uint256 offset = p;
    uint256 pointer = p;
    while (pointer < offset + sz) {
      (fieldId, wireType, bytesRead) = ProtoBufRuntime._decode_key(pointer, bs);
      pointer += bytesRead;
      if (fieldId == 1) {
        pointer += _read_issuanceId(pointer, bs, r, counters);
      }
      else if (fieldId == 2) {
        pointer += _read_makerAddress(pointer, bs, r, counters);
      }
      else if (fieldId == 3) {
        pointer += _read_takerAddress(pointer, bs, r, counters);
      }
      else if (fieldId == 4) {
        pointer += _read_engagementDueTimestamp(pointer, bs, r, counters);
      }
      else if (fieldId == 5) {
        pointer += _read_issuanceDueTimestamp(pointer, bs, r, counters);
      }
      else if (fieldId == 6) {
        pointer += _read_creationTimestamp(pointer, bs, r, counters);
      }
      else if (fieldId == 7) {
        pointer += _read_engagementTimestamp(pointer, bs, r, counters);
      }
      else if (fieldId == 8) {
        pointer += _read_settlementTimestamp(pointer, bs, r, counters);
      }
      else if (fieldId == 9) {
        pointer += _read_issuanceProxyAddress(pointer, bs, r, counters);
      }
      else if (fieldId == 10) {
        pointer += _read_issuanceEscrowAddress(pointer, bs, r, counters);
      }
      else if (fieldId == 11) {
        pointer += _read_state(pointer, bs, r, counters);
      }
      else if (fieldId == 12) {
        pointer += _read_supplementalLineItems(pointer, bs, nil(), counters);
      }
      
      else {
        if (wireType == ProtoBufRuntime.WireType.Fixed64) {
          uint256 size;
          (, size) = ProtoBufRuntime._decode_fixed64(pointer, bs);
          pointer += size;
        }
        if (wireType == ProtoBufRuntime.WireType.Fixed32) {
          uint256 size;
          (, size) = ProtoBufRuntime._decode_fixed32(pointer, bs);
          pointer += size;
        }
        if (wireType == ProtoBufRuntime.WireType.Varint) {
          uint256 size;
          (, size) = ProtoBufRuntime._decode_varint(pointer, bs);
          pointer += size;
        }
        if (wireType == ProtoBufRuntime.WireType.LengthDelim) {
          uint256 size;
          (, size) = ProtoBufRuntime._decode_lendelim(pointer, bs);
          pointer += size;
        }
      }

    }
    pointer = offset;
    r.supplementalLineItems = new SupplementalLineItem.Data[](counters[12]);

    while (pointer < offset + sz) {
      (fieldId, wireType, bytesRead) = ProtoBufRuntime._decode_key(pointer, bs);
      pointer += bytesRead;
      if (fieldId == 1) {
        pointer += _read_issuanceId(pointer, bs, nil(), counters);
      }
      else if (fieldId == 2) {
        pointer += _read_makerAddress(pointer, bs, nil(), counters);
      }
      else if (fieldId == 3) {
        pointer += _read_takerAddress(pointer, bs, nil(), counters);
      }
      else if (fieldId == 4) {
        pointer += _read_engagementDueTimestamp(pointer, bs, nil(), counters);
      }
      else if (fieldId == 5) {
        pointer += _read_issuanceDueTimestamp(pointer, bs, nil(), counters);
      }
      else if (fieldId == 6) {
        pointer += _read_creationTimestamp(pointer, bs, nil(), counters);
      }
      else if (fieldId == 7) {
        pointer += _read_engagementTimestamp(pointer, bs, nil(), counters);
      }
      else if (fieldId == 8) {
        pointer += _read_settlementTimestamp(pointer, bs, nil(), counters);
      }
      else if (fieldId == 9) {
        pointer += _read_issuanceProxyAddress(pointer, bs, nil(), counters);
      }
      else if (fieldId == 10) {
        pointer += _read_issuanceEscrowAddress(pointer, bs, nil(), counters);
      }
      else if (fieldId == 11) {
        pointer += _read_state(pointer, bs, nil(), counters);
      }
      else if (fieldId == 12) {
        pointer += _read_supplementalLineItems(pointer, bs, r, counters);
      }
      else {
        if (wireType == ProtoBufRuntime.WireType.Fixed64) {
          uint256 size;
          (, size) = ProtoBufRuntime._decode_fixed64(pointer, bs);
          pointer += size;
        }
        if (wireType == ProtoBufRuntime.WireType.Fixed32) {
          uint256 size;
          (, size) = ProtoBufRuntime._decode_fixed32(pointer, bs);
          pointer += size;
        }
        if (wireType == ProtoBufRuntime.WireType.Varint) {
          uint256 size;
          (, size) = ProtoBufRuntime._decode_varint(pointer, bs);
          pointer += size;
        }
        if (wireType == ProtoBufRuntime.WireType.LengthDelim) {
          uint256 size;
          (, size) = ProtoBufRuntime._decode_lendelim(pointer, bs);
          pointer += size;
        }
      }
    }
    return (r, sz);
  }

  // field readers

  /**
   * @dev The decoder for reading a field
   * @param p The offset of bytes array to start decode
   * @param bs The bytes array to be decoded
   * @param r The in-memory struct
   * @param counters The counters for repeated fields
   * @return The number of bytes decoded
   */
  function _read_issuanceId(
    uint256 p, 
    bytes memory bs, 
    Data memory r, 
    uint[13] memory counters
  ) internal pure returns (uint) {
    /**
     * if `r` is NULL, then only counting the number of fields.
     */
    (uint256 x, uint256 sz) = ProtoBufRuntime._decode_sol_uint256(p, bs);
    if (isNil(r)) {
      counters[1] += 1;
    } else {
      r.issuanceId = x;
      if (counters[1] > 0) counters[1] -= 1;
    }
    return sz;
  }

  /**
   * @dev The decoder for reading a field
   * @param p The offset of bytes array to start decode
   * @param bs The bytes array to be decoded
   * @param r The in-memory struct
   * @param counters The counters for repeated fields
   * @return The number of bytes decoded
   */
  function _read_makerAddress(
    uint256 p, 
    bytes memory bs, 
    Data memory r, 
    uint[13] memory counters
  ) internal pure returns (uint) {
    /**
     * if `r` is NULL, then only counting the number of fields.
     */
    (address x, uint256 sz) = ProtoBufRuntime._decode_sol_address(p, bs);
    if (isNil(r)) {
      counters[2] += 1;
    } else {
      r.makerAddress = x;
      if (counters[2] > 0) counters[2] -= 1;
    }
    return sz;
  }

  /**
   * @dev The decoder for reading a field
   * @param p The offset of bytes array to start decode
   * @param bs The bytes array to be decoded
   * @param r The in-memory struct
   * @param counters The counters for repeated fields
   * @return The number of bytes decoded
   */
  function _read_takerAddress(
    uint256 p, 
    bytes memory bs, 
    Data memory r, 
    uint[13] memory counters
  ) internal pure returns (uint) {
    /**
     * if `r` is NULL, then only counting the number of fields.
     */
    (address x, uint256 sz) = ProtoBufRuntime._decode_sol_address(p, bs);
    if (isNil(r)) {
      counters[3] += 1;
    } else {
      r.takerAddress = x;
      if (counters[3] > 0) counters[3] -= 1;
    }
    return sz;
  }

  /**
   * @dev The decoder for reading a field
   * @param p The offset of bytes array to start decode
   * @param bs The bytes array to be decoded
   * @param r The in-memory struct
   * @param counters The counters for repeated fields
   * @return The number of bytes decoded
   */
  function _read_engagementDueTimestamp(
    uint256 p, 
    bytes memory bs, 
    Data memory r, 
    uint[13] memory counters
  ) internal pure returns (uint) {
    /**
     * if `r` is NULL, then only counting the number of fields.
     */
    (uint256 x, uint256 sz) = ProtoBufRuntime._decode_sol_uint256(p, bs);
    if (isNil(r)) {
      counters[4] += 1;
    } else {
      r.engagementDueTimestamp = x;
      if (counters[4] > 0) counters[4] -= 1;
    }
    return sz;
  }

  /**
   * @dev The decoder for reading a field
   * @param p The offset of bytes array to start decode
   * @param bs The bytes array to be decoded
   * @param r The in-memory struct
   * @param counters The counters for repeated fields
   * @return The number of bytes decoded
   */
  function _read_issuanceDueTimestamp(
    uint256 p, 
    bytes memory bs, 
    Data memory r, 
    uint[13] memory counters
  ) internal pure returns (uint) {
    /**
     * if `r` is NULL, then only counting the number of fields.
     */
    (uint256 x, uint256 sz) = ProtoBufRuntime._decode_sol_uint256(p, bs);
    if (isNil(r)) {
      counters[5] += 1;
    } else {
      r.issuanceDueTimestamp = x;
      if (counters[5] > 0) counters[5] -= 1;
    }
    return sz;
  }

  /**
   * @dev The decoder for reading a field
   * @param p The offset of bytes array to start decode
   * @param bs The bytes array to be decoded
   * @param r The in-memory struct
   * @param counters The counters for repeated fields
   * @return The number of bytes decoded
   */
  function _read_creationTimestamp(
    uint256 p, 
    bytes memory bs, 
    Data memory r, 
    uint[13] memory counters
  ) internal pure returns (uint) {
    /**
     * if `r` is NULL, then only counting the number of fields.
     */
    (uint256 x, uint256 sz) = ProtoBufRuntime._decode_sol_uint256(p, bs);
    if (isNil(r)) {
      counters[6] += 1;
    } else {
      r.creationTimestamp = x;
      if (counters[6] > 0) counters[6] -= 1;
    }
    return sz;
  }

  /**
   * @dev The decoder for reading a field
   * @param p The offset of bytes array to start decode
   * @param bs The bytes array to be decoded
   * @param r The in-memory struct
   * @param counters The counters for repeated fields
   * @return The number of bytes decoded
   */
  function _read_engagementTimestamp(
    uint256 p, 
    bytes memory bs, 
    Data memory r, 
    uint[13] memory counters
  ) internal pure returns (uint) {
    /**
     * if `r` is NULL, then only counting the number of fields.
     */
    (uint256 x, uint256 sz) = ProtoBufRuntime._decode_sol_uint256(p, bs);
    if (isNil(r)) {
      counters[7] += 1;
    } else {
      r.engagementTimestamp = x;
      if (counters[7] > 0) counters[7] -= 1;
    }
    return sz;
  }

  /**
   * @dev The decoder for reading a field
   * @param p The offset of bytes array to start decode
   * @param bs The bytes array to be decoded
   * @param r The in-memory struct
   * @param counters The counters for repeated fields
   * @return The number of bytes decoded
   */
  function _read_settlementTimestamp(
    uint256 p, 
    bytes memory bs, 
    Data memory r, 
    uint[13] memory counters
  ) internal pure returns (uint) {
    /**
     * if `r` is NULL, then only counting the number of fields.
     */
    (uint256 x, uint256 sz) = ProtoBufRuntime._decode_sol_uint256(p, bs);
    if (isNil(r)) {
      counters[8] += 1;
    } else {
      r.settlementTimestamp = x;
      if (counters[8] > 0) counters[8] -= 1;
    }
    return sz;
  }

  /**
   * @dev The decoder for reading a field
   * @param p The offset of bytes array to start decode
   * @param bs The bytes array to be decoded
   * @param r The in-memory struct
   * @param counters The counters for repeated fields
   * @return The number of bytes decoded
   */
  function _read_issuanceProxyAddress(
    uint256 p, 
    bytes memory bs, 
    Data memory r, 
    uint[13] memory counters
  ) internal pure returns (uint) {
    /**
     * if `r` is NULL, then only counting the number of fields.
     */
    (address x, uint256 sz) = ProtoBufRuntime._decode_sol_address(p, bs);
    if (isNil(r)) {
      counters[9] += 1;
    } else {
      r.issuanceProxyAddress = x;
      if (counters[9] > 0) counters[9] -= 1;
    }
    return sz;
  }

  /**
   * @dev The decoder for reading a field
   * @param p The offset of bytes array to start decode
   * @param bs The bytes array to be decoded
   * @param r The in-memory struct
   * @param counters The counters for repeated fields
   * @return The number of bytes decoded
   */
  function _read_issuanceEscrowAddress(
    uint256 p, 
    bytes memory bs, 
    Data memory r, 
    uint[13] memory counters
  ) internal pure returns (uint) {
    /**
     * if `r` is NULL, then only counting the number of fields.
     */
    (address x, uint256 sz) = ProtoBufRuntime._decode_sol_address(p, bs);
    if (isNil(r)) {
      counters[10] += 1;
    } else {
      r.issuanceEscrowAddress = x;
      if (counters[10] > 0) counters[10] -= 1;
    }
    return sz;
  }

  /**
   * @dev The decoder for reading a field
   * @param p The offset of bytes array to start decode
   * @param bs The bytes array to be decoded
   * @param r The in-memory struct
   * @param counters The counters for repeated fields
   * @return The number of bytes decoded
   */
  function _read_state(
    uint256 p, 
    bytes memory bs, 
    Data memory r, 
    uint[13] memory counters
  ) internal pure returns (uint) {
    /**
     * if `r` is NULL, then only counting the number of fields.
     */
    (int64 tmp, uint256 sz) = ProtoBufRuntime._decode_enum(p, bs);
    IssuanceProperties.State x = decode_State(tmp);
    if (isNil(r)) {
      counters[11] += 1;
    } else {
      r.state = x;
      if(counters[11] > 0) counters[11] -= 1;
    }
    return sz;
  }

  /**
   * @dev The decoder for reading a field
   * @param p The offset of bytes array to start decode
   * @param bs The bytes array to be decoded
   * @param r The in-memory struct
   * @param counters The counters for repeated fields
   * @return The number of bytes decoded
   */
  function _read_supplementalLineItems(
    uint256 p, 
    bytes memory bs, 
    Data memory r, 
    uint[13] memory counters
  ) internal pure returns (uint) {
    /**
     * if `r` is NULL, then only counting the number of fields.
     */
    (SupplementalLineItem.Data memory x, uint256 sz) = _decode_SupplementalLineItem(p, bs);
    if (isNil(r)) {
      counters[12] += 1;
    } else {
      r.supplementalLineItems[r.supplementalLineItems.length - counters[12]] = x;
      if (counters[12] > 0) counters[12] -= 1;
    }
    return sz;
  }

  // struct decoder
  /**
   * @dev The decoder for reading a inner struct field
   * @param p The offset of bytes array to start decode
   * @param bs The bytes array to be decoded
   * @return The decoded inner-struct
   * @return The number of bytes used to decode
   */
  function _decode_SupplementalLineItem(uint256 p, bytes memory bs)
    internal 
    pure 
    returns (SupplementalLineItem.Data memory, uint) 
  {
    uint256 pointer = p;
    (uint256 sz, uint256 bytesRead) = ProtoBufRuntime._decode_varint(pointer, bs);
    pointer += bytesRead;
    (SupplementalLineItem.Data memory r, ) = SupplementalLineItem._decode(pointer, bs, sz);
    return (r, sz + bytesRead);
  }


  // Encoder section

  /**
   * @dev The main encoder for memory
   * @param r The struct to be encoded
   * @return The encoded byte array
   */
  function encode(Data memory r) internal pure returns (bytes memory) {
    bytes memory bs = new bytes(_estimate(r));
    uint256 sz = _encode(r, 32, bs);
    assembly {
      mstore(bs, sz)
    }
    return bs;
  }
  // inner encoder

  /**
   * @dev The encoder for internal usage
   * @param r The struct to be encoded
   * @param p The offset of bytes array to start decode
   * @param bs The bytes array to be decoded
   * @return The number of bytes encoded
   */
  function _encode(Data memory r, uint256 p, bytes memory bs)
    internal 
    pure 
    returns (uint) 
  {
    uint256 offset = p;
    uint256 pointer = p;
    uint256 i;
    pointer += ProtoBufRuntime._encode_key(
      1, 
      ProtoBufRuntime.WireType.LengthDelim, 
      pointer, 
      bs
    );
    pointer += ProtoBufRuntime._encode_sol_uint256(r.issuanceId, pointer, bs);
    pointer += ProtoBufRuntime._encode_key(
      2, 
      ProtoBufRuntime.WireType.LengthDelim, 
      pointer, 
      bs
    );
    pointer += ProtoBufRuntime._encode_sol_address(r.makerAddress, pointer, bs);
    pointer += ProtoBufRuntime._encode_key(
      3, 
      ProtoBufRuntime.WireType.LengthDelim, 
      pointer, 
      bs
    );
    pointer += ProtoBufRuntime._encode_sol_address(r.takerAddress, pointer, bs);
    pointer += ProtoBufRuntime._encode_key(
      4, 
      ProtoBufRuntime.WireType.LengthDelim, 
      pointer, 
      bs
    );
    pointer += ProtoBufRuntime._encode_sol_uint256(r.engagementDueTimestamp, pointer, bs);
    pointer += ProtoBufRuntime._encode_key(
      5, 
      ProtoBufRuntime.WireType.LengthDelim, 
      pointer, 
      bs
    );
    pointer += ProtoBufRuntime._encode_sol_uint256(r.issuanceDueTimestamp, pointer, bs);
    pointer += ProtoBufRuntime._encode_key(
      6, 
      ProtoBufRuntime.WireType.LengthDelim, 
      pointer, 
      bs
    );
    pointer += ProtoBufRuntime._encode_sol_uint256(r.creationTimestamp, pointer, bs);
    pointer += ProtoBufRuntime._encode_key(
      7, 
      ProtoBufRuntime.WireType.LengthDelim, 
      pointer, 
      bs
    );
    pointer += ProtoBufRuntime._encode_sol_uint256(r.engagementTimestamp, pointer, bs);
    pointer += ProtoBufRuntime._encode_key(
      8, 
      ProtoBufRuntime.WireType.LengthDelim, 
      pointer, 
      bs
    );
    pointer += ProtoBufRuntime._encode_sol_uint256(r.settlementTimestamp, pointer, bs);
    pointer += ProtoBufRuntime._encode_key(
      9, 
      ProtoBufRuntime.WireType.LengthDelim, 
      pointer, 
      bs
    );
    pointer += ProtoBufRuntime._encode_sol_address(r.issuanceProxyAddress, pointer, bs);
    pointer += ProtoBufRuntime._encode_key(
      10, 
      ProtoBufRuntime.WireType.LengthDelim, 
      pointer, 
      bs
    );
    pointer += ProtoBufRuntime._encode_sol_address(r.issuanceEscrowAddress, pointer, bs);
    pointer += ProtoBufRuntime._encode_key(
      11, 
      ProtoBufRuntime.WireType.Varint, 
      pointer, 
      bs
    );
    int64 _enum_state = encode_State(r.state);
    pointer += ProtoBufRuntime._encode_enum(_enum_state, pointer, bs);
    for(i = 0; i < r.supplementalLineItems.length; i++) {
      pointer += ProtoBufRuntime._encode_key(
        12, 
        ProtoBufRuntime.WireType.LengthDelim, 
        pointer, 
        bs)
      ;
      pointer += SupplementalLineItem._encode_nested(r.supplementalLineItems[i], pointer, bs);
    }
    return pointer - offset;
  }
  // nested encoder

  /**
   * @dev The encoder for inner struct
   * @param r The struct to be encoded
   * @param p The offset of bytes array to start decode
   * @param bs The bytes array to be decoded
   * @return The number of bytes encoded
   */
  function _encode_nested(Data memory r, uint256 p, bytes memory bs)
    internal 
    pure 
    returns (uint) 
  {
    /**
     * First encoded `r` into a temporary array, and encode the actual size used.
     * Then copy the temporary array into `bs`.
     */
    uint256 offset = p;
    uint256 pointer = p;
    bytes memory tmp = new bytes(_estimate(r));
    uint256 tmpAddr = ProtoBufRuntime.getMemoryAddress(tmp);
    uint256 bsAddr = ProtoBufRuntime.getMemoryAddress(bs);
    uint256 size = _encode(r, 32, tmp);
    pointer += ProtoBufRuntime._encode_varint(size, pointer, bs);
    ProtoBufRuntime.copyBytes(tmpAddr + 32, bsAddr + pointer, size);
    pointer += size;
    delete tmp;
    return pointer - offset;
  }
  // estimator

  /**
   * @dev The estimator for a struct
   * @param r The struct to be encoded
   * @return The number of bytes encoded in estimation
   */
  function _estimate(
    Data memory r
  ) internal pure returns (uint) {
    uint256 e;uint256 i;
    e += 1 + 35;
    e += 1 + 23;
    e += 1 + 23;
    e += 1 + 35;
    e += 1 + 35;
    e += 1 + 35;
    e += 1 + 35;
    e += 1 + 35;
    e += 1 + 23;
    e += 1 + 23;
    e += 1 + ProtoBufRuntime._sz_enum(encode_State(r.state));
    for(i = 0; i < r.supplementalLineItems.length; i++) {
      e += 1 + ProtoBufRuntime._sz_lendelim(SupplementalLineItem._estimate(r.supplementalLineItems[i]));
    }
    return e;
  }

  //store function
  /**
   * @dev Store in-memory struct to storage
   * @param input The in-memory struct
   * @param output The in-storage struct
   */
  function store(Data memory input, Data storage output) internal {
    output.issuanceId = input.issuanceId;
    output.makerAddress = input.makerAddress;
    output.takerAddress = input.takerAddress;
    output.engagementDueTimestamp = input.engagementDueTimestamp;
    output.issuanceDueTimestamp = input.issuanceDueTimestamp;
    output.creationTimestamp = input.creationTimestamp;
    output.engagementTimestamp = input.engagementTimestamp;
    output.settlementTimestamp = input.settlementTimestamp;
    output.issuanceProxyAddress = input.issuanceProxyAddress;
    output.issuanceEscrowAddress = input.issuanceEscrowAddress;
    output.state = input.state;

    output.supplementalLineItems.length = input.supplementalLineItems.length;
    for(uint256 i12 = 0; i12 < input.supplementalLineItems.length; i12++) {
      SupplementalLineItem.store(input.supplementalLineItems[i12], output.supplementalLineItems[i12]);
    }
    

  }


  //array helpers for SupplementalLineItems
  /**
   * @dev Add value to an array
   * @param self The in-memory struct
   * @param value The value to add
   */
  function addSupplementalLineItems(Data memory self, SupplementalLineItem.Data memory value) internal pure {
    /**
     * First resize the array. Then add the new element to the end.
     */
    SupplementalLineItem.Data[] memory tmp = new SupplementalLineItem.Data[](self.supplementalLineItems.length + 1);
    for (uint256 i = 0; i < self.supplementalLineItems.length; i++) {
      tmp[i] = self.supplementalLineItems[i];
    }
    tmp[self.supplementalLineItems.length] = value;
    self.supplementalLineItems = tmp;
  }


  //utility functions
  /**
   * @dev Return an empty struct
   * @return The empty struct
   */
  function nil() internal pure returns (Data memory r) {
    assembly {
      r := 0
    }
  }

  /**
   * @dev Test whether a struct is empty
   * @param x The struct to be tested
   * @return True if it is empty
   */
  function isNil(Data memory x) internal pure returns (bool r) {
    assembly {
      r := iszero(x)
    }
  }
}
//library IssuanceProperties