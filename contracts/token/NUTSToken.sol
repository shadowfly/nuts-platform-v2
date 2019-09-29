pragma solidity ^0.5.0;

import "../lib/token/ERC20Burnable.sol";
import "./ERC20CappedMintable.sol";

/**
 * @title NUTS Token.
 */
contract NUTSToken is ERC20CappedMintable, ERC20Burnable {
    string public constant name = 'NUTS Token';
    string public constant symbol = 'NUTS';
    uint8 public constant decimals = 18;
    uint256 public constant cap = 200000000 * 10 ** uint256(decimals);

    constructor() ERC20CappedMintable(cap) public {
    }

}