import { Polorizer, Document } from '../src'
import { Raw } from '../src/raw';

describe('Test Polorizer', () => {
    test('Example Polorizer', () => {
        const orange = {
            name: 'orange',
            cost: 300,
            alias: ['tangerine', 'mandarin']
        }
    
        // Create a new Polorizer
        const polorizer = new Polorizer();
    
        // Encode the Name field as a string
        polorizer.polorizeString(orange.name)
        // Encode the Cost field as an integer
        polorizer.polorizeInteger(orange.cost)
    
    
        // Create a new Polorizer to serialize the Alias field (slice)
        const aliases = new Polorizer();
        // Encode each element in the Alias slice as a string
        orange.alias.forEach((alias) => aliases.polorizeString(alias))
        // Encode the Polorizer containing the alias field contents as 
        // packed data
        polorizer.polorizePacked(aliases)
    
        // Print the serialized bytes in the Polorizer buffer
        console.log(polorizer.bytes())
    
        // Output:
        // [14 79 6 99 142 1 111 114 97 110 103 101 1 44 63 6 150 1 116 97 110 
        // 103 101 114 105 110 101 109 97 110 100 97 114 105 110]
    })


    test('Null', () => {
        const polorizer = new Polorizer();

        expect(polorizer.bytes()).toEqual(new Uint8Array([0]))
        expect(polorizer.packed()).toEqual(new Uint8Array([14, 15]))

        polorizer.polorizeNull()
        expect(polorizer.bytes()).toEqual(new Uint8Array([0]))
        expect(polorizer.packed()).toEqual(new Uint8Array([14, 31, 0]))

        polorizer.polorizeNull()
        expect(polorizer.bytes()).toEqual(new Uint8Array([14, 47, 0, 0]))
        expect(polorizer.packed()).toEqual(new Uint8Array([14, 47, 0, 0]))

        polorizer.polorizeNull()
        expect(polorizer.bytes()).toEqual(new Uint8Array([14, 63, 0, 0, 0]))
        expect(polorizer.packed()).toEqual(new Uint8Array([14, 63, 0, 0, 0]))
    })

    test('Bool', () => {
        const polorizer = new Polorizer();

        polorizer.polorizeBool(true)
        expect(polorizer.bytes()).toEqual(new Uint8Array([2]))
        expect(polorizer.packed()).toEqual(new Uint8Array([14, 31, 2]))

        polorizer.polorizeBool(false)
        expect(polorizer.bytes()).toEqual(new Uint8Array([14, 47, 2, 1]))
        expect(polorizer.packed()).toEqual(new Uint8Array([14, 47, 2, 1]))
    })

    test('String', () => {
        const polorizer = new Polorizer()

        polorizer.polorizeString('foo')
        expect(polorizer.bytes()).toEqual(new Uint8Array([
            6, 102, 111, 111
        ]))
        expect(polorizer.packed()).toEqual(new Uint8Array([
            14, 31, 6, 102, 111, 111
        ]))

        polorizer.polorizeString('bar')
        expect(polorizer.bytes()).toEqual(new Uint8Array([
            14, 47, 6, 54, 102, 111, 111, 98, 97, 114
        ]))
        expect(polorizer.packed()).toEqual(new Uint8Array([
            14, 47, 6, 54, 102, 111, 111, 98, 97, 114
        ]))
    })

    test('Bytes', () => {
        const polorizer = new Polorizer()

        polorizer.polorizeBytes(new Uint8Array([1, 1, 1, 1]))
        expect(polorizer.bytes()).toEqual(new Uint8Array([
            6, 1, 1, 1, 1
        ]))
        expect(polorizer.packed()).toEqual(new Uint8Array([
            14, 31, 6, 1, 1, 1, 1
        ]))

        polorizer.polorizeBytes(new Uint8Array([2, 2, 2, 2]))
        expect(polorizer.bytes()).toEqual(new Uint8Array([
            14, 47, 6, 70, 1, 1, 1, 1, 2, 2, 2, 2
        ]))
        expect(polorizer.packed()).toEqual(new Uint8Array([
            14, 47, 6, 70, 1, 1, 1, 1, 2, 2, 2, 2
        ]))
    })

    test('Uint', () => {
        const polorizer = new Polorizer()

        polorizer.polorizeInteger(300)
        expect(polorizer.bytes()).toEqual(new Uint8Array([
            3, 1, 44
        ]))
        expect(polorizer.packed()).toEqual(new Uint8Array([
            14, 31, 3, 1, 44
        ]))

        polorizer.polorizeInteger(250)
        expect(polorizer.bytes()).toEqual(new Uint8Array([
            14, 47, 3, 35, 1, 44, 250
        ]))
        expect(polorizer.packed()).toEqual(new Uint8Array([
            14, 47, 3, 35, 1, 44, 250
        ]))
    })

    test('Int', () => {
        const polorizer = new Polorizer()

        polorizer.polorizeInteger(300)
        expect(polorizer.bytes()).toEqual(new Uint8Array([
            3, 1, 44
        ]))
        expect(polorizer.packed()).toEqual(new Uint8Array([
            14, 31, 3, 1, 44
        ]))

        polorizer.polorizeInteger(-250)
        expect(polorizer.bytes()).toEqual(new Uint8Array([
            14, 47, 3, 36, 1, 44, 250
        ]))
        expect(polorizer.packed()).toEqual(new Uint8Array([
            14, 47, 3, 36, 1, 44, 250
        ]))
    })

    test('Float', () => {
        const polorizer = new Polorizer()

        polorizer.polorizeFloat(123.456)
        expect(polorizer.bytes()).toEqual(new Uint8Array([
            7, 64, 94, 221, 47, 26, 159, 190, 119
        ]))
        expect(polorizer.packed()).toEqual(new Uint8Array([
            14, 31, 7, 64, 94, 221, 47, 26, 159, 190, 119
        ]))

        polorizer.polorizeFloat(-99.99)
        expect(polorizer.bytes()).toEqual(new Uint8Array([
            14, 63, 7, 135, 1, 64, 94, 221, 47, 26, 159, 190, 119, 192, 
            88, 255, 92, 40, 245, 194, 143
        ]))
        expect(polorizer.packed()).toEqual(new Uint8Array([
            14, 63, 7, 135, 1, 64, 94, 221, 47, 26, 159, 190, 119, 192, 88, 
            255, 92, 40, 245, 194, 143
        ]))
    })

    // test('BigInt', () => {
    //     const polorizer = new Polorizer()

    //     polorizer.polorizeInteger(9223372036854775807n)
    //     expect(polorizer.bytes()).toEqual(new Uint8Array([
    //         3, 127, 255, 255, 255, 255, 255, 255, 255
    //     ]))
    //     expect(polorizer.packed()).toEqual(new Uint8Array([
    //         14, 31, 3, 127, 255, 255, 255, 255, 255, 255, 255
    //     ]))

	// 	polorizer.polorizeInteger(-9223372036854775808n)
    //     expect(polorizer.bytes()).toEqual(new Uint8Array([
    //         14, 63, 3, 132, 1, 127, 255, 255, 255, 255, 255, 255, 255, 128, 
	// 		0, 0, 0, 0, 0, 0, 0
    //     ]))
    //     expect(polorizer.packed()).toEqual(new Uint8Array([
    //         14, 63, 3, 132, 1, 127, 255, 255, 255, 255, 255, 255, 255, 128, 
	// 		0, 0, 0, 0, 0, 0, 0
    //     ]))
    // })

	test('Raw', () => {
		const polorizer = new Polorizer()

		polorizer.polorizeRaw(new Raw(new Uint8Array([6, 98, 111, 111])))
        expect(polorizer.bytes()).toEqual(new Uint8Array([
            5, 6, 98, 111, 111
        ]))
		expect(polorizer.packed()).toEqual(new Uint8Array([
            14, 31, 5, 6, 98, 111, 111
        ]))

		polorizer.polorizeRaw(new Raw(new Uint8Array([0])))
        expect(polorizer.bytes()).toEqual(new Uint8Array([
            14, 47, 5, 69, 6, 98, 111, 111, 0
        ]))
		expect(polorizer.packed()).toEqual(new Uint8Array([
            14, 47, 5, 69, 6, 98, 111, 111, 0
        ]))
	})

	test('Document', () => {
		const doc = new Document()
		doc.setInteger('far', 123)
		doc.setString('foo', 'bar')

		const polorizer = new Polorizer()
		
		polorizer.polorizeDocument(doc.document)
		expect(polorizer.bytes()).toEqual(new Uint8Array([
            13, 95, 6, 53, 86, 133, 1, 102, 97, 114, 3, 123, 102, 111, 111, 
			6, 98, 97, 114
        ]))
		expect(polorizer.packed()).toEqual(new Uint8Array([
            14, 31, 13, 95, 6, 53, 86, 133, 1, 102, 97, 114, 3, 123, 102, 111, 
			111, 6, 98, 97, 114
        ]))
	})

	test('Packed', () => {
		const polorizer = new Polorizer()

		polorizer.polorizeRaw(new Raw(new Uint8Array([6, 98, 111, 111])))

		const another = new Polorizer()

		another.polorizePacked(polorizer)
		expect(another.bytes()).toEqual(new Uint8Array([
			14, 31, 5, 6, 98, 111, 111
		]))
		expect(another.packed()).toEqual(new Uint8Array([
			14, 31, 14, 31, 5, 6, 98, 111, 111
		]))
	})

	test('Inner', () => {
		const polorizer = new Polorizer()

		polorizer.polorizeInteger(5)
		expect(polorizer.bytes()).toEqual(new Uint8Array([
            3, 5
        ]))
		expect(polorizer.packed()).toEqual(new Uint8Array([
            14, 31, 3, 5
        ]))

		const another = new Polorizer()
		another.polorizeString('foo')

		polorizer.polorizeInner(another)
		expect(polorizer.bytes()).toEqual(new Uint8Array([
            14, 47, 3, 22, 5, 102, 111, 111
        ]))
		expect(polorizer.packed()).toEqual(new Uint8Array([
            14, 47, 3, 22, 5, 102, 111, 111
        ]))

		another.polorizeInteger(250)
		polorizer.polorizeInner(another)
		expect(polorizer.bytes()).toEqual(new Uint8Array([
            14, 63, 3, 22, 78, 5, 102, 111, 111, 47, 6, 51, 102, 111, 111, 250
        ]))
		expect(polorizer.packed()).toEqual(new Uint8Array([
			14, 63, 3, 22, 78, 5, 102, 111, 111, 47, 6, 51, 102, 111, 111, 250
        ]))
	})
})

// TODO: Check for null if required