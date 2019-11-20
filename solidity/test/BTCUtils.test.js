/* global artifacts contract before it assert */
const BN = require('bn.js');

/* eslint-disable-next-line no-unresolved */
const vectors = require('./testVectors.json');

const BTCUtilsDelegate = artifacts.require('BTCUtilsTest');

const {
  lastBytes,
  lastBytesError,
  reverseEndianness,
  bytesToUint,
  hash160,
  hash256,
  hash256MerkleStep,
  extractOutpoint,
  extractSequenceLEWitness,
  extractSequenceWitness,
  extractSequenceLELegacy,
  extractSequenceLegacy,
  extractOutputScriptLen,
  extractHash,
  extractHashError,
  extractOpReturnData,
  extractOpReturnDataError,
  extractInputAtIndex,
  isLegacyInput,
  extractValueLE,
  extractValue,
  determineInputLength,
  extractScriptSig,
  extractScriptSigLen,
  validateVin,
  validateVout,
  determineOutputLength,
  determineOutputLengthError,
  extractOutputAtIndex,
  extractMerkleRootBE,
  extractTarget,
  extractPrevBlockBE,
  extractTimestamp,
  verifyHash256Merkle,
  determineVarIntDataLength,
  retargetAlgorithm
} = vectors;

contract('BTCUtils', () => {
  let instance;

  before(async () => {
    instance = await BTCUtilsDelegate.new();
  });

  it('gets the last bytes correctly', async () => {
    for (let i = 0; i < lastBytes.length; i += 1) {
      const res = await instance.lastBytes(lastBytes[i].input.bytes, lastBytes[i].input.num);
      assert.strictEqual(res, lastBytes[i].output);
    }
  });

  it('errors if slice is larger than the bytearray', async () => {
    for (let i = 0; i < lastBytesError.length; i += 1) {
      try {
        await instance.lastBytes(lastBytesError[i].input.bytes, lastBytesError[i].input.num);
        assert(false, 'expected an errror');
      } catch (e) {
        const err = (lastBytesError[i].solidityError
          ? lastBytesError[i].solidityError : lastBytesError[i].errorMessage);
        assert.include(e.message, err);
      }
    }
  });

  it('reverses endianness', async () => {
    for (let i = 0; i < reverseEndianness.length; i += 1) {
      const res = await instance.reverseEndianness(reverseEndianness[i].input);
      assert.strictEqual(res, reverseEndianness[i].output);
    }
  });

  it('converts big-endian bytes to integers', async () => {
    for (let i = 0; i < bytesToUint.length; i += 1) {
      const res = await instance.bytesToUint(bytesToUint[i].input);
      assert(res, new BN(bytesToUint[i].output, 10));
    }

    // max uint256: (2^256)-1
    const res = await instance.bytesToUint(`0x${'ff'.repeat(32)}`);
    assert(
      res, new BN('115792089237316195423570985008687907853269984665640564039457584007913129639935', 10)
    );
  });

  it('implements bitcoin\'s hash160', async () => {
    for (let i = 0; i < hash160.length; i += 1) {
      const res = await instance.hash160(hash160[i].input);
      assert.strictEqual(res, hash160[i].output);
    }
  });

  it('implements bitcoin\'s hash256', async () => {
    for (let i = 0; i < hash256.length; i += 1) {
      const res = await instance.hash256(hash256[i].input);
      assert.strictEqual(res, hash256[i].output);
    }
  });

  it('implements hash256MerkleStep', async () => {
    for (let i = 0; i < hash256MerkleStep.length; i += 1) {
      /* eslint-disable-next-line */
      const res = await instance._hash256MerkleStep(
        hash256MerkleStep[i].input[0],
        hash256MerkleStep[i].input[1]
      );
      assert.strictEqual(res, hash256MerkleStep[i].output);
    }
  });

  it('extracts a sequence from a witness input as LE and int', async () => {
    for (let i = 0; i < extractSequenceLEWitness.length; i += 1) {
      const res = await instance.extractSequenceLEWitness(extractSequenceLEWitness[i].input);
      assert.strictEqual(res, extractSequenceLEWitness[i].output);
    }

    for (let i = 0; i < extractSequenceWitness.length; i += 1) {
      const res = await instance.extractSequenceWitness(extractSequenceWitness[i].input);
      assert(res.eq(new BN(extractSequenceWitness[i].output, 16)));
    }
  });

  it('extracts a sequence from a legacy input as LE and int', async () => {
    for (let i = 0; i < extractSequenceLELegacy.length; i += 1) {
      const res = await instance.extractSequenceLELegacy(extractSequenceLELegacy[i].input);
      assert.strictEqual(res, extractSequenceLELegacy[i].output);
    }

    for (let i = 0; i < extractSequenceLegacy.length; i += 1) {
      const res = await instance.extractSequenceLegacy(extractSequenceLegacy[i].input);
      assert(res.eq(new BN(extractSequenceLegacy[i].output, 16)));
    }
  });

  it('extracts an outpoint as bytes', async () => {
    for (let i = 0; i < extractSequenceLegacy.length; i += 1) {
      const res = await instance.extractOutpoint(extractOutpoint[i].input);
      assert.strictEqual(res, extractOutpoint[i].output);
    }
  });

  /* Witness Output */
  it('extracts the length of the output script', async () => {
    for (let i = 0; i < extractOutputScriptLen.length; i += 1) {
      const res = await instance.extractOutputScriptLen(extractOutputScriptLen[i].input);
      if (extractOutputScriptLen[i].hasOwnProperty('solOutput')) {
        assert.strictEqual(res, extractOutputScriptLen[i].solOutput);
      } else {
        assert.strictEqual(res, extractOutputScriptLen[i].output);
      }
    }
  });

  it('extracts the hash from an output', async () => {
    for (let i = 0; i < extractHash.length; i += 1) {
      const res = await instance.extractHash(extractHash[i].input);
      assert.strictEqual(res, extractHash[i].output);
    }

    for (let i = 0; i < extractHashError.length; i += 1) {
      const res = await instance.extractHash(extractHashError[i].input);
      assert.isNull(res);
    }
  });

  it('extracts the value as LE and int', async () => {
    for (let i = 0; i < extractValueLE.length; i += 1) {
      const res = await instance.extractValueLE(extractValueLE[i].input);
      assert.strictEqual(res, extractValueLE[i].output);
    }

    for (let i = 0; i < extractValue.length; i += 1) {
      const res = await instance.extractValue(extractValue[i].input);
      assert(res.eq(new BN(extractValue[i].output, 16)));
    }
  });

  it('determines input length', async () => {
    for (let i = 0; i < determineInputLength.length; i += 1) {
      const res = await instance.determineInputLength(determineInputLength[i].input);
      assert(res.eq(new BN(determineInputLength[i].output, 10)));
    }
  });

  it('extracts op_return data blobs', async () => {
    for (let i = 0; i < extractOpReturnData.length; i += 1) {
      const res = await instance.extractOpReturnData(extractOpReturnData[i].input);
      assert.strictEqual(res, extractOpReturnData[i].output);
    }

    for (let i = 0; i < extractOpReturnDataError.length; i += 1) {
      const res = await instance.extractOpReturnData(extractOpReturnDataError[i].input);
      assert.isNull(res);
    }
  });

  it('extracts inputs at specified indices', async () => {
    for (let i = 0; i < extractInputAtIndex.length; i += 1) {
      const res = await instance.extractInputAtIndex(
        extractInputAtIndex[i].input.vin,
        extractInputAtIndex[i].input.index
      );
      assert.strictEqual(res, extractInputAtIndex[i].output);
    }
  });

  it('sorts legacy from witness inputs', async () => {
    for (let i = 0; i < isLegacyInput.length; i += 1) {
      const res = await instance.isLegacyInput(isLegacyInput[i].input);
      assert.strictEqual(res, isLegacyInput[i].output);
    }
  });

  it('extracts the scriptSig from inputs', async () => {
    for (let i = 0; i < extractScriptSig.length; i += 1) {
      const res = await instance.extractScriptSig(extractScriptSig[i].input);
      assert.strictEqual(res, extractScriptSig[i].output);
    }
  });

  it('extracts the length of the VarInt and scriptSig from inputs', async () => {
    for (let i = 0; i < extractScriptSigLen.length; i += 1) {
      const res = await instance.extractScriptSigLen(extractScriptSigLen[i].input);
      assert(res[0].eq(new BN(extractScriptSigLen[i].output[0], 10)));
      assert(res[1].eq(new BN(extractScriptSigLen[i].output[1], 10)));
    }
  });

  it('validates vin length based on stated size', async () => {
    for (let i = 0; i < validateVin.length; i += 1) {
      const res = await instance.validateVin(validateVin[i].input);
      assert.strictEqual(res, validateVin[i].output);
    }
  });

  it('validates vout length based on stated size', async () => {
    for (let i = 0; i < validateVout.length; i += 1) {
      if (validateVout[i].solidityError) {
        try {
          await instance.validateVout(validateVout[i].input);
          assert(false, 'expected an error');
        } catch (e) {
          assert.include(e.message, validateVout[i].solidityError);
        }
      } else {
        const res = await instance.validateVout(validateVout[i].input);
        assert.strictEqual(res, validateVout[i].output);
      }
    }
  });

  it('determines output length properly', async () => {
    for (let i = 0; i < determineOutputLength.length; i += 1) {
      const res = await instance.determineOutputLength(determineOutputLength[i].input);
      assert(res.eq(new BN(determineOutputLength[i].output, 10)));
    }

    for (let i = 0; i < determineOutputLengthError.length; i += 1) {
      try {
        await instance.determineOutputLength(determineOutputLengthError[i].input);
        assert(false, 'expected an error');
      } catch (e) {
        assert.include(e.message, determineOutputLengthError[i].errorMessage);
      }
    }
  });

  it('extracts outputs at specified indices', async () => {
    for (let i = 0; i < extractOutputAtIndex.length; i += 1) {
      const res = await instance.extractOutputAtIndex(
        extractOutputAtIndex[i].input.vout,
        extractOutputAtIndex[i].input.index
      );
      assert.strictEqual(res, extractOutputAtIndex[i].output);
    }
  });

  it('extracts a root from a header', async () => {
    for (let i = 0; i < extractMerkleRootBE.length; i += 1) {
      const res = await instance.extractMerkleRootBE(extractMerkleRootBE[i].input);
      assert.strictEqual(res, extractMerkleRootBE[i].output);
    }
  });

  it('extracts the target from a header', async () => {
    for (let i = 0; i < extractTarget.length; i += 1) {
      const res = await instance.extractTarget(extractTarget[i].input);
      assert(res.eq(new BN(extractTarget[i].output.slice(2), 16)));
    }
  });

  it('extracts the prev block hash', async () => {
    for (let i = 0; i < extractPrevBlockBE.length; i += 1) {
      const res = await instance.extractPrevBlockBE(extractPrevBlockBE[i].input);
      assert.strictEqual(res, extractPrevBlockBE[i].output);
    }
  });

  it('extracts a timestamp from a header', async () => {
    for (let i = 0; i < extractTimestamp.length; i += 1) {
      const res = await instance.extractTimestamp(extractTimestamp[i].input);
      assert(res.eq(new BN(extractTimestamp[i].output, 10)));
    }
  });

  it('verifies a bitcoin merkle root', async () => {
    for (let i = 0; i < verifyHash256Merkle.length; i += 1) {
      const res = await instance.verifyHash256Merkle(
        verifyHash256Merkle[i].input.proof,
        verifyHash256Merkle[i].input.index
      ); // 0-indexed
      assert.strictEqual(res, verifyHash256Merkle[i].output);
    }
  });

  it('determines VarInt data lengths correctly', async () => {
    for (let i = 0; i < determineVarIntDataLength.length; i += 1) {
      const res = await instance.determineVarIntDataLength(`0x${(determineVarIntDataLength[i].input).toString(16)}`);
      assert(res.eq(new BN(determineVarIntDataLength[i].output, 10)));
    }
  });

  it('calculates consensus-correct retargets', async () => {
    let firstTimestamp;
    let secondTimestamp;
    let previousTarget;
    let expectedNewTarget;
    let res;
    for (let i = 0; i < retargetAlgorithm.length; i += 1) {
      firstTimestamp = retargetAlgorithm[i].input[0].timestamp;
      secondTimestamp = retargetAlgorithm[i].input[1].timestamp;
      previousTarget = await instance.extractTarget.call(retargetAlgorithm[i].input[1].hex);
      expectedNewTarget = await instance.extractTarget.call(retargetAlgorithm[i].input[2].hex);
      res = await instance.retargetAlgorithm(previousTarget, firstTimestamp, secondTimestamp);
      // (response & expected) == expected
      // this converts our full-length target into truncated block target
      assert(res.uand(expectedNewTarget).eq(expectedNewTarget));

      secondTimestamp = firstTimestamp + 5 * 2016 * 10 * 60; // longer than 4x
      res = await instance.retargetAlgorithm(previousTarget, firstTimestamp, secondTimestamp);
      assert(res.divn(4).uand(previousTarget).eq(previousTarget));

      secondTimestamp = firstTimestamp + 2016 * 10 * 14; // shorter than 1/4x
      res = await instance.retargetAlgorithm(previousTarget, firstTimestamp, secondTimestamp);
      assert(res.muln(4).uand(previousTarget).eq(previousTarget));
    }
  });

  it('extracts difficulty from a header', async () => {
    let actual;
    let expected;
    for (let i = 0; i < retargetAlgorithm.length; i += 1) {
      actual = await instance.extractDifficulty(retargetAlgorithm[i].input[0].hex);
      expected = new BN(retargetAlgorithm[i].input[0].difficulty, 10);
      assert(actual.eq(expected));

      actual = await instance.extractDifficulty(retargetAlgorithm[i].input[1].hex);
      expected = new BN(retargetAlgorithm[i].input[1].difficulty, 10);
      assert(actual.eq(expected));

      actual = await instance.extractDifficulty(retargetAlgorithm[i].input[2].hex);
      expected = new BN(retargetAlgorithm[i].input[2].difficulty, 10);
      assert(actual.eq(expected));
    }
  });
});
