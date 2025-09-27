# GLI-19 Compliant Cryptographically Secure Pseudo Random Number Generator (RNG)

This repository implements a cryptographically secure Random Number Generator (RNG) built on **HMAC-DRBG** (Deterministic Random Bit Generator).  

The project follows the technical requirements from [GLI-19 Chapter 3: Random Number Generator (RNG) Requirements](https://gaminglabs.com/gli-standards/).

This implementation is designed as production-ready RNG code and can be submitted for **GLI / iTech Labs certification**.


## Structure
- `cli` - CLI tools for generating test data
- `examples` - Example usage of the RNG
- `src/hmac-drbg` - HMAC-DRBG implementation
- `src/rng` - Shuffling, scaling and draw utilities
- `src/utils` - Some helpful utilities


## Dieharder Docker
This project includes a Dockerfile with [dieharder](https://webhome.phy.duke.edu/~rgb/General/dieharder.php).

```shell
docker build -t 1fun-rng .
docker run -it --rm 1fun-rng
```

> ⚠️ **Note on Dieharder Testing**  
> Some statistical tests in the Dieharder suite are very data-hungry.  
> To achieve a full **"PASSED"** status across all tests, a **large amount of RNG output data** may be required.  
> This is expected behavior since certain tests need millions or even billions of samples to converge reliably.


## Generate ASCII output to txt file for usage with dieharder

```shell
npx ts-node ./cli/generate-dieharder-ascii.ts \
  --server-seed abcdefghijklmnopqrstuvwxyz \
  --client-seed abcdefghijklmnopqrstuvwxyz \
  --count 100000000 \
  --destination data/hmac-dbrng.txt
```

This creates a file `hmac-dbrng.txt` with 100_000_000 values generated with the HMAC-DRBG algorithm.

It can be used with the [dieharder](https://webhome.phy.duke.edu/~rgb/General/dieharder.php) test suite:
```shell
dieharder -g 202 -f data/hmac-dbrng.txt -a
```


## Generate raw output to bin file for usage with dieharder

```shell
npx ts-node ./cli/generate-dieharder-ascii.ts \
  --server-seed abcdefghijklmnopqrstuvwxyz \
  --client-seed abcdefghijklmnopqrstuvwxyz \
  --count 100000000 \
  --destination data/hmac-dbrng.bin
```

This creates a file `hmac-dbrng.bin` with 100_000_000 values generated with the HMAC-DRBG algorithm.

It can be used with the [dieharder](https://webhome.phy.duke.edu/~rgb/General/dieharder.php) test suite:
```shell
dieharder -g 201 -f data/hmac-dbrng.bin -a
```


## Generate output to txt file for GLI

```shell
npx ts-node ./cli/generate-gli-output.ts \
  --server-seed abcdefghijklmnopqrstuvwxyz \
  --client-seed abcdefghijklmnopqrstuvwxyz \
  --range-start 1 \
  --range-end 52 \
  --selections 52 \
  --draws 100000 \
  --destination data/gli.txt
```

The additional parameter `--with-replacements` allows for numbers to be repeated within selections.

> range-start and range-end are inclusive


## Acknowledgements
This project draws ideas and inspiration (and in some cases code concepts) from the following open-source projects:

- [Mintablo/mintablo-rng](https://github.com/Mintablo/mintablo-rng)
- [bcoin-org/bcrypto](https://github.com/bcoin-org/bcrypto)
- [indutny/hmac-drbg](https://github.com/indutny/hmac-drbg)
