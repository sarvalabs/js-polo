import { Depolorizer, WireType } from '../src'
import { PackDepolorizer } from '../src/packdepolorizer'

interface Fruit {
    name?: string
    cost?: number | bigint
    aliases?: string[]
}

describe('Test Depolorizer', () => {
    test('Example Depolorizer', () => {
        const fruit:Fruit = {}
        const wire = new Uint8Array([
            14, 79, 6, 99, 142, 1, 111, 114, 97, 110, 103, 101, 1, 44, 63, 
            6, 150, 1, 116, 97, 110, 103, 101, 114, 105, 110, 101, 109, 97, 
            110, 100, 97, 114, 105, 110
        ]);

        // Create a new Pack Depolorizer from the data
        const packDepolorizer = new PackDepolorizer(wire);
        const depolorizer = packDepolorizer.depolorizer;

        fruit.name = depolorizer.depolorizeString()
        fruit.cost = depolorizer.depolorizeInteger()
        fruit.aliases = []
        
        const aliases = depolorizer.depolorizePacked()

        while(!aliases.isDone()) {
            const alias = aliases.depolorizeString()
            fruit.aliases?.push(alias)
        }

        // Print the deserialized object
        console.log(fruit)

        // Output:
        // { name: 'orange', cost: 300, aliases: ['tangerine', 'mandarin'] }
    })

    test('Null', () => {
        let depolorizer = new Depolorizer(new Uint8Array([14, 63, 0, 2, 0]))

        depolorizer = depolorizer.depolorizePacked()

        depolorizer.depolorizeNull()
        expect(depolorizer.isDone()).toBe(false)

        depolorizer.depolorizeNull()
        expect(depolorizer.isDone()).toBe(false)

        depolorizer.depolorizeNull()
        expect(depolorizer.isDone()).toBe(true)

        // TODO: check and handle errors
    })

    test('Bool', () => {
        let depolorizer = new Depolorizer(new Uint8Array([14, 47, 2, 1]))

        depolorizer = depolorizer.depolorizePacked()

        let value = depolorizer.depolorizeBool()
        expect(value).toBe(true)
        expect(depolorizer.isDone()).toBe(false)

        value = depolorizer.depolorizeBool()
        expect(value).toBe(false)
        expect(depolorizer.isDone()).toBe(true)
    })

    test('String', () => {
        let depolorizer = new Depolorizer(new Uint8Array([
            14, 47, 6, 54, 102, 111, 111, 98, 97, 114
        ]))

        depolorizer = depolorizer.depolorizePacked()

        let value = depolorizer.depolorizeString()
        expect(value).toBe('foo')
        expect(depolorizer.isDone()).toBe(false)

        value = depolorizer.depolorizeString()
        expect(value).toBe('bar')
        expect(depolorizer.isDone()).toBe(true)
    })

    test('Bytes', () => {
        let depolorizer = new Depolorizer(new Uint8Array([
            14, 47, 6, 70, 1, 1, 1, 1, 2, 2, 2, 2
        ]))

        depolorizer = depolorizer.depolorizePacked()

        let value = depolorizer.depolorizeBytes()
        expect(value).toEqual(new Uint8Array([1, 1, 1, 1]))
        expect(depolorizer.isDone()).toBe(false)

        value = depolorizer.depolorizeBytes()
        expect(value).toEqual(new Uint8Array([2, 2, 2, 2]))
        expect(depolorizer.isDone()).toBe(true)
    })

    test('Uint', () => {
        let depolorizer = new Depolorizer(new Uint8Array([
            14, 47, 3, 35, 1, 44, 250
        ]))

        depolorizer = depolorizer.depolorizePacked()

        let value = depolorizer.depolorizeInteger()
        expect(value).toBe(300)
        expect(depolorizer.isDone()).toBe(false)

        value = depolorizer.depolorizeInteger()
        expect(value).toBe(250)
        expect(depolorizer.isDone()).toBe(true)
    })

    test('Int', () => {
        let depolorizer = new Depolorizer(new Uint8Array([
            14, 47, 3, 36, 1, 44, 250
        ]))

        depolorizer = depolorizer.depolorizePacked()

        let value = depolorizer.depolorizeInteger()
        expect(value).toBe(300)
        expect(depolorizer.isDone()).toBe(false)

        value = depolorizer.depolorizeInteger()
        expect(value).toBe(-250)
        expect(depolorizer.isDone()).toBe(true)
    })

    test('Float', () => {
        let depolorizer = new Depolorizer(new Uint8Array([
            14, 63, 7, 135, 1, 64, 94, 221, 47, 26, 159, 190, 119, 192, 
            88, 255, 92, 40, 245, 194, 143
        ]))

        depolorizer = depolorizer.depolorizePacked()

        let value = depolorizer.depolorizeFloat()
        expect(value).toBe(123.456)
        expect(depolorizer.isDone()).toBe(false)

        value = depolorizer.depolorizeFloat()
        expect(value).toBe(-99.99)
        expect(depolorizer.isDone()).toBe(true)
    })

    // Todo: check bigint, packed

    test('inner', () => {
        let depolorizer = new Depolorizer(new Uint8Array([14, 47, 0, 3, 5]))

        depolorizer = depolorizer.depolorizePacked()

        let inner = depolorizer.depolorizeInner()
        expect(inner).toEqual(
            new Depolorizer(new Uint8Array([WireType.WIRE_NULL]))
        )

        inner = depolorizer.depolorizeInner()
        expect(inner).toEqual(
            new Depolorizer(new Uint8Array([WireType.WIRE_POSINT, 5]))
        )
    })
})