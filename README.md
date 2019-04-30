# FSM
FSM with supporting additional condition on transitions

## Example
```typescript
    import { FSM } from 'fsm';
    
    const fsmConfig = {
        baseState: 'standby',

        states: {
            standby: {
                onEnter: () => {}, // optional callbacks
                onLeave: () => {}, // optional callbacks
            },
            state1: {
            },
            state2: {
            },
            state3: {
            }
        },

        transitions: {
            // Transions may contains additional conditions.
            // In this case transition must be as Array of transition ways with additional conditions
            tr1: [
                {
                    from: 'standby',
                    to: 'state1',
                    condition: (approve) => { return approve; }
                },
                {
                    from: 'standby',
                    to: 'state2',
                    condition: (not_approve) => { return !not_approve; }
                }
            ],
            // Simple way of transition
            tr2: {
                from: 'standby',
                to: 'state3'
            },
            tr3: {
                from: 'state2',
                to: 'standby'
            },
            tr4: {
                from: 'state1',
                to: 'standby'
            },
            tr5: {
                from: 'state3',
                to: 'standby'
            }
        },
    };

    const fsm = new FSM(fsmConfig);
```
