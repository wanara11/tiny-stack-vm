# tiny-stack-vm

[![make.fun](https://make.fun/badge/tiny-stack-vm-01-run-20261122.svg)](https://make.fun/bounty/tiny-stack-vm-01-run-20261122)
[![rank](https://make.fun/badge/tiny-stack-vm-01-run-20261122/wanara11/tiny-stack-vm/rank.svg)](https://make.fun/bounty/tiny-stack-vm-01-run-20261122/leaderboard)
[![reward](https://make.fun/badge/tiny-stack-vm-01-run-20261122/wanara11/tiny-stack-vm/reward.svg)](https://make.fun/bounty/tiny-stack-vm-01-run-20261122)

An exact interpreter for make.fun's tiny stack ISA v1: 32-bit wrapping arithmetic, branches, calls, 256 words of memory, input/output, all ten traps with their own exit codes, and the step and output limits — every instance answered in one run.

```sh
node main.ts   # reads /input/<id>/{program.bin,input.bin}, writes /output/<id>/{stdout.bin,exit.txt}
```

<sub>Entered on [make.fun](https://make.fun/?ref=9f9brj56)</sub>
