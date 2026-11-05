// Command gen-vectors writes the test vectors that compare js-polo with
// go-polo, the reference implementation of the POLO Wire Specification.
//
// Each vector holds a wire, a js-polo schema and the result of go-polo:
//
//   - A valid vector holds a value. go-polo encodes the value to the wire,
//     and it decodes the wire back to the same value.
//   - An invalid vector holds a wire that go-polo rejects for the target
//     type. The vector holds the error of go-polo.
//
// Usage, from the root of js-polo:
//
//	cd scripts/gen-vectors && go run . > ../../__tests__/vectors/go-polo.json
//
// The program stops with an error if go-polo does not give the expected
// result for a vector.
package main

import (
	"bytes"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"math"
	"math/big"
	"os"
	"reflect"
	"runtime/debug"
	"strings"

	"github.com/sarvalabs/go-polo"
)

// Vector is one test vector in the JSON file.
type Vector struct {
	Name    string          `json:"name"`
	Schema  json.RawMessage `json:"schema"`
	Options *Options        `json:"options,omitempty"`
	Wire    string          `json:"wire"`
	Valid   bool            `json:"valid"`
	Value   any             `json:"value,omitempty"`
	Error   string          `json:"error,omitempty"`
}

// Options are the agreements of a vector.
type Options struct {
	DocStructs bool `json:"docStructs,omitempty"`
}

// File is the JSON file.
type File struct {
	Comment string   `json:"comment"`
	GoPolo  string   `json:"goPolo"`
	Vectors []Vector `json:"vectors"`
}

var vectors []Vector

// encodingOptions returns the go-polo options for the options of a vector.
func encodingOptions(options *Options) []polo.EncodingOptions {
	if options != nil && options.DocStructs {
		return []polo.EncodingOptions{polo.DocStructs()}
	}

	return nil
}

// valid adds a vector for a value. go-polo encodes the value, decodes the
// wire into a new value of the same type, and encodes it again. The two
// wires must be the same.
func valid(name, schema string, value any, options *Options) {
	opts := encodingOptions(options)

	wire, err := polo.Polorize(value, opts...)
	if err != nil {
		fail("%s: go-polo cannot encode the value: %v", name, err)
	}

	target := reflect.New(reflect.TypeOf(value))
	if err = polo.Depolorize(target.Interface(), wire, opts...); err != nil {
		fail("%s: go-polo cannot decode its own wire %x: %v", name, wire, err)
	}

	again, err := polo.Polorize(target.Elem().Interface(), opts...)
	if err != nil || !bytes.Equal(wire, again) {
		fail("%s: the round trip changes the wire %x to %x (%v)", name, wire, again, err)
	}

	vectors = append(vectors, Vector{
		Name: name, Schema: json.RawMessage(schema), Options: options,
		// The value of the vector is the value that go-polo decodes. For
		// example, go-polo decodes a nil document value to a Raw that holds a Null.
		Wire: hex.EncodeToString(wire), Valid: true, Value: tag(target.Elem()),
	})
}

// invalid adds a vector for a wire that go-polo must reject for a target type.
func invalid(name, schema, wire string, target any, options *Options) {
	data, err := hex.DecodeString(strings.ReplaceAll(wire, " ", ""))
	if err != nil {
		fail("%s: the wire is not hexadecimal: %v", name, err)
	}

	err = polo.Depolorize(target, data, encodingOptions(options)...)
	if err == nil {
		fail("%s: go-polo accepts the wire %s", name, wire)
	}

	vectors = append(vectors, Vector{
		Name: name, Schema: json.RawMessage(schema), Options: options,
		Wire: hex.EncodeToString(data), Valid: false, Error: err.Error(),
	})
}

// tag gives a value in a JSON form that keeps its type. js-polo reads this form.
func tag(value reflect.Value) any {
	switch value.Type() {
	case reflect.TypeOf(polo.Document{}):
		doc := value.Interface().(polo.Document)
		if doc == nil {
			return nil
		}

		entries := [][2]string{}
		for _, key := range sortedKeys(doc) {
			entries = append(entries, [2]string{key, hex.EncodeToString(doc[key])})
		}

		return map[string]any{"document": entries}

	case reflect.TypeOf(polo.Raw{}):
		if value.IsNil() {
			return nil
		}

		return map[string]any{"raw": hex.EncodeToString(value.Bytes())}

	case reflect.TypeOf(big.Int{}):
		number := value.Interface().(big.Int)
		return map[string]any{"int": number.String()}
	}

	switch value.Kind() {
	case reflect.Pointer:
		if value.IsNil() {
			return nil
		}

		return tag(value.Elem())

	case reflect.Bool:
		return map[string]any{"bool": value.Bool()}

	case reflect.Int, reflect.Int8, reflect.Int16, reflect.Int32, reflect.Int64:
		return map[string]any{"int": fmt.Sprint(value.Int())}

	case reflect.Uint, reflect.Uint8, reflect.Uint16, reflect.Uint32, reflect.Uint64:
		return map[string]any{"int": fmt.Sprint(value.Uint())}

	case reflect.Float64:
		return map[string]any{"float": fmt.Sprintf("%016x", math.Float64bits(value.Float()))}

	case reflect.String:
		return map[string]any{"string": value.String()}

	case reflect.Slice, reflect.Array:
		if value.Kind() == reflect.Slice && value.IsNil() {
			return nil
		}

		if value.Type().Elem().Kind() == reflect.Uint8 {
			data := make([]byte, value.Len())
			reflect.Copy(reflect.ValueOf(data), value)

			return map[string]any{"bytes": hex.EncodeToString(data)}
		}

		items := []any{}
		for i := 0; i < value.Len(); i++ {
			items = append(items, tag(value.Index(i)))
		}

		return map[string]any{"list": items}

	case reflect.Map:
		if value.IsNil() {
			return nil
		}

		entries := [][2]any{}
		iterator := value.MapRange()
		for iterator.Next() {
			entries = append(entries, [2]any{tag(iterator.Key()), tag(iterator.Value())})
		}

		return map[string]any{"map": entries}

	case reflect.Struct:
		fields := [][2]any{}
		for i := 0; i < value.NumField(); i++ {
			field := value.Type().Field(i)

			name := field.Name
			if key := field.Tag.Get("polo"); key != "" {
				name = key
			}

			fields = append(fields, [2]any{name, tag(value.Field(i))})
		}

		return map[string]any{"struct": fields}
	}

	fail("tag: the type %v has no JSON form", value.Type())
	return nil
}

func sortedKeys(doc polo.Document) []string {
	keys := make([]string, 0, len(doc))
	for key := range doc {
		keys = append(keys, key)
	}

	// Go compares strings byte by byte. This is the order of UTF-8 bytes.
	for i := 1; i < len(keys); i++ {
		for j := i; j > 0 && keys[j] < keys[j-1]; j-- {
			keys[j], keys[j-1] = keys[j-1], keys[j]
		}
	}

	return keys
}

func fail(format string, args ...any) {
	fmt.Fprintf(os.Stderr, "gen-vectors: "+format+"\n", args...)
	os.Exit(1)
}

func ptr[T any](value T) *T { return &value }

func bigInt(text string) big.Int {
	number, ok := new(big.Int).SetString(text, 10)
	if !ok {
		fail("bigInt: %q is not a decimal integer", text)
	}

	return *number
}

// The js-polo schemas.
const (
	sNull     = `{"kind":"null"}`
	sBool     = `{"kind":"bool"}`
	sInt      = `{"kind":"integer"}`
	sOptInt   = `{"kind":"integer","optional":true}`
	sFloat    = `{"kind":"float"}`
	sString   = `{"kind":"string"}`
	sBytes    = `{"kind":"bytes"}`
	sRaw      = `{"kind":"raw"}`
	sDocument = `{"kind":"document"}`
	sInts     = `{"kind":"array","fields":{"values":{"kind":"integer"}}}`
	sOptInts  = `{"kind":"array","fields":{"values":{"kind":"integer","optional":true}}}`
	sIntLists = `{"kind":"array","fields":{"values":` + sInts + `}}`
	sPair     = `{"kind":"struct","fields":{"A":{"kind":"integer"},"B":{"kind":"string"}}}`
	sOptField = `{"kind":"struct","fields":{"A":{"kind":"integer","optional":true}}}`
	sOneField = `{"kind":"struct","fields":{"A":{"kind":"integer"}}}`
	sEmpty    = `{"kind":"struct","fields":{}}`
)

func sMap(keys, values string) string {
	return `{"kind":"map","fields":{"keys":` + keys + `,"values":` + values + `}}`
}

// The types of issue #25. The polo tags give the keys of the documents.
type (
	Inner struct {
		Amount uint64 `polo:"amount"`
	}
	Outer struct {
		Items []Inner `polo:"items"`
	}
	Calldata struct {
		Outers []Outer `polo:"outers"`
	}
)

const (
	sInner    = `{"kind":"struct","fields":{"amount":{"kind":"integer"}}}`
	sOuter    = `{"kind":"struct","fields":{"items":{"kind":"array","fields":{"values":` + sInner + `}}}}`
	sCalldata = `{"kind":"struct","fields":{"outers":{"kind":"array","fields":{"values":` + sOuter + `}}}}`
)

type Pair struct {
	A uint64
	B string
}

// AssetActionPayload has the same fields as common.AssetActionPayload of
// go-moi. An asset ID is a 32-byte array. js-polo uses bytes for it.
type AssetActionPayload struct {
	AssetID  [32]byte              `polo:"asset_id"`
	Callsite string                `polo:"callsite"`
	Calldata []byte                `polo:"calldata"`
	Funds    map[[32]byte]*big.Int `polo:"funds"`
}

const sAssetAction = `{"kind":"struct","fields":{"asset_id":{"kind":"bytes"},"callsite":{"kind":"string"},` +
	`"calldata":{"kind":"bytes"},"funds":{"kind":"map","fields":{"keys":{"kind":"bytes"},"values":{"kind":"integer"}}}}}`

// assetID returns the KMOI asset ID with the byte 20 set to a value.
func assetID(byte20 byte) [32]byte {
	data, _ := hex.DecodeString("1080fffe4cd973c4eb83cdb8870c0de209736270491b7acc99873da100000000")

	var id [32]byte
	copy(id[:], data)
	id[20] = byte20

	return id
}

func main() {
	docStructs := &Options{DocStructs: true}

	// Booleans and integers
	valid("false", sBool, false, nil)
	valid("true", sBool, true, nil)
	valid("uint64 0", sInt, uint64(0), nil)
	valid("uint64 5", sInt, uint64(5), nil)
	valid("uint64 300", sInt, uint64(300), nil)
	valid("uint64 2^53 - 1", sInt, uint64(1<<53-1), nil)
	valid("uint64 2^53", sInt, uint64(1<<53), nil)
	valid("uint64 max", sInt, uint64(math.MaxUint64), nil)
	valid("int64 -1", sInt, int64(-1), nil)
	valid("int64 -300", sInt, int64(-300), nil)
	valid("int64 min", sInt, int64(math.MinInt64), nil)
	valid("big.Int 2^64", sInt, bigInt("18446744073709551616"), nil)
	valid("big.Int 2^256 - 1", sInt, bigInt(new(big.Int).Sub(new(big.Int).Lsh(big.NewInt(1), 256), big.NewInt(1)).String()), nil)
	valid("big.Int -2^100", sInt, bigInt("-1267650600228229401496703205376"), nil)

	// Floats
	valid("float64 0", sFloat, float64(0), nil)
	valid("float64 -0", sFloat, math.Copysign(0, -1), nil)
	valid("float64 1", sFloat, float64(1), nil)
	valid("float64 1.5", sFloat, 1.5, nil)
	valid("float64 -99.99", sFloat, -99.99, nil)
	valid("float64 +Inf", sFloat, math.Inf(1), nil)
	valid("float64 -Inf", sFloat, math.Inf(-1), nil)
	valid("float64 quiet NaN with payload", sFloat, math.Float64frombits(0x7ff8000000000001), nil)
	valid("float64 signaling NaN", sFloat, math.Float64frombits(0x7ff0000000000001), nil)

	// Strings and bytes
	valid("string empty", sString, "", nil)
	valid("string foo", sString, "foo", nil)
	valid("string NUL", sString, "\x00", nil)
	valid("string byte order mark", sString, "\uFEFF", nil)
	valid("string U+FFFD", sString, "\uFFFD", nil)
	valid("string U+1F600", sString, "\U0001F600", nil)
	valid("string U+10FFFF", sString, "\U0010FFFF", nil)
	valid("bytes nil", sBytes, []byte(nil), nil)
	valid("bytes empty", sBytes, []byte{}, nil)
	valid("bytes ff 00", sBytes, []byte{0xff, 0x00}, nil)
	valid("[32]byte as bytes", sBytes, [32]byte{1, 2, 3}, nil)

	// Lists
	valid("[]uint64 nil", sInts, []uint64(nil), nil)
	valid("[]uint64 empty", sInts, []uint64{}, nil)
	valid("[]uint64 1, 2", sInts, []uint64{1, 2}, nil)
	valid("[]uint64 0, 0", sInts, []uint64{0, 0}, nil)
	valid("[]*uint64 1, nil, 3", sOptInts, []*uint64{ptr(uint64(1)), nil, ptr(uint64(3))}, nil)
	valid("[][]uint64 [1], []", sIntLists, [][]uint64{{1}, {}}, nil)

	// Maps
	valid("map[string]uint64 nil", sMap(sString, sInt), map[string]uint64(nil), nil)
	valid("map[string]uint64 empty", sMap(sString, sInt), map[string]uint64{}, nil)
	valid("map[string]uint64 a, b", sMap(sString, sInt), map[string]uint64{"b": 2, "a": 1}, nil)
	valid("map[string]uint64 a, aa, b", sMap(sString, sInt), map[string]uint64{"b": 1, "aa": 1, "a": 1}, nil)
	valid("map[string]uint64 U+FFFF, U+10000", sMap(sString, sInt), map[string]uint64{"\U00010000": 1, "\uFFFF": 1}, nil)
	valid("map[uint64]uint64 9, 10", sMap(sInt, sInt), map[uint64]uint64{10: 1, 9: 1}, nil)
	valid("map[uint64]uint64 2, 100", sMap(sInt, sInt), map[uint64]uint64{100: 1, 2: 1}, nil)
	valid("map[int64]uint64 -2, -1, 0, 1", sMap(sInt, sInt), map[int64]uint64{1: 1, 0: 1, -1: 1, -2: 1}, nil)
	valid("map[float64]uint64 -Inf, -1, 9.5, 10.5", sMap(sFloat, sInt),
		map[float64]uint64{10.5: 1, 9.5: 1, -1: 1, math.Inf(-1): 1}, nil)
	valid("map[bool]uint64 false, true", sMap(sBool, sInt), map[bool]uint64{true: 1, false: 1}, nil)
	valid("map[[2]byte]uint64 as bytes keys", sMap(sBytes, sInt), map[[2]byte]uint64{{1, 0}: 1, {0, 0xff}: 1}, nil)
	valid("map[[2]byte]uint64 9 01, 0a 01", sMap(sBytes, sInt), map[[2]byte]uint64{{10, 1}: 1, {9, 1}: 1}, nil)
	valid("map[string]*uint64 with a nil value", sMap(sString, sOptInt), map[string]*uint64{"a": nil, "b": ptr(uint64(2))}, nil)

	// Structs
	valid("struct with zero values", sPair, Pair{}, nil)
	valid("struct 5, A", sPair, Pair{A: 5, B: "A"}, nil)
	valid("struct with a nil pointer", sOptField, struct{ A *uint64 }{}, nil)
	valid("struct with no fields", sEmpty, struct{}{}, nil)
	valid("issue #25 shape as packs", sCalldata,
		Calldata{Outers: []Outer{{Items: []Inner{{Amount: 1}}}, {Items: []Inner{{Amount: 2}}}}}, nil)

	// An asset invoke with funds (go-moi common.AssetActionPayload)
	valid("asset invoke with funds", sAssetAction, AssetActionPayload{
		AssetID: assetID(0x49), Callsite: "Transfer", Calldata: []byte{0x0d},
		Funds: map[[32]byte]*big.Int{assetID(0x0a): big.NewInt(6), assetID(0x09): big.NewInt(5)},
	}, nil)
	valid("asset invoke with no funds", sAssetAction, AssetActionPayload{
		AssetID: assetID(0x49), Callsite: "Transfer", Calldata: []byte{0x0d},
	}, nil)
	valid("asset invoke with empty funds", sAssetAction, AssetActionPayload{
		AssetID: assetID(0x49), Callsite: "Transfer", Calldata: []byte{0x0d}, Funds: map[[32]byte]*big.Int{},
	}, nil)

	// Documents, raw, and the agreement DocStructs
	valid("document a", sDocument, polo.Document{"a": polo.Raw{3, 1}}, nil)
	valid("document empty key, a, b", sDocument, polo.Document{"b": polo.Raw{3, 1}, "a": polo.Raw{3, 1}, "": polo.Raw{3, 1}}, nil)
	valid("document with a nil value", sDocument, polo.Document{"a": nil}, nil)
	valid("document empty", sDocument, polo.Document{}, nil)
	valid("document U+FFFF, U+10000", sDocument, polo.Document{"\U00010000": polo.Raw{3, 1}, "\uFFFF": polo.Raw{3, 1}}, nil)
	valid("raw that holds a Null", sRaw, polo.Raw{0}, nil)
	valid("struct as document", sPair, Pair{}, docStructs)
	valid("struct as document 5, A", sPair, Pair{A: 5, B: "A"}, docStructs)
	valid("issue #25 shape as documents", sCalldata,
		Calldata{Outers: []Outer{{Items: []Inner{{Amount: 1}}}, {Items: []Inner{{Amount: 2}}}}}, docStructs)

	// C1: tags are minimal
	invalid("C1 top-level tag", sInt, "83 00 05", new(uint64), nil)
	invalid("C1 head tag", sInts, "0e 3f 83 00 03 05 06 07", new([]uint64), nil)
	invalid("C1 later head tag", sInts, "0e 3f 03 93 00 05 06", new([]uint64), nil)
	invalid("C1 load tag", sInts, "0e af 80 00 03 13 05 06", new([]uint64), nil)
	invalid("C1 tag is not complete", sInt, "83", new(uint64), nil)

	// C2: the offset of the top-level tag is 0
	invalid("C2 top-level offset", sInt, "13 05", new(uint64), nil)
	invalid("C2 top-level offset of a document value", sOneField,
		hex.EncodeToString(polo.Document{"A": polo.Raw{0x13, 5}}.Bytes()), new(struct{ A uint64 }), docStructs)
	invalid("C2 empty wire", sInt, "", new(uint64), nil)

	// C3: integers are minimal
	invalid("C3 leading zero", sInt, "03 00 05", new(uint64), nil)
	invalid("C3 leading zero negative", sInt, "04 00 05", new(int64), nil)
	invalid("C3 negative zero", sInt, "04", new(int64), nil)
	invalid("C3 leading zero big.Int", sInt, "03 00 ff", new(big.Int), nil)

	// C4: Null, False and True have no data
	invalid("C4 true with data", sBool, "02 ff", new(bool), nil)
	invalid("C4 false with data", sBool, "01 ff", new(bool), nil)
	invalid("C4 null with data", sOptInt, "00 ff", new(*uint64), nil)
	invalid("C4 null element with data", sOptInts, "0e 2f 00 13 01", new([]*uint64), nil)

	// C5: lengths are exact
	invalid("C5 float with 4 bytes", sFloat, "07 3f c0 00 00", new(float64), nil)
	invalid("C5 float with 9 bytes", sFloat, "07 3f f8 00 00 00 00 00 00 99", new(float64), nil)
	invalid("C5 float with no data", sFloat, "07", new(float64), nil)

	// C6: the pack framing is exact
	invalid("C6 first offset is not 0", sInts, "0e 2f 13 23 00 05", new([]uint64), nil)
	invalid("C6 offset past the end", sInts, "0e 2f 03 13", new([]uint64), nil)
	invalid("C6 offset less than the offset before it", sInts, "0e 3f 03 23 13 01 02 03", new([]uint64), nil)
	invalid("C6 empty pack with a body", sInts, "0e 0f ff", new([]uint64), nil)
	invalid("C6 empty document with a body", sDocument, "0d 0f 05", new(polo.Document), nil)
	invalid("C6 struct with an extra element", sPair, "0e 3f 03 16 26 05 41 42", new(Pair), nil)
	invalid("C6 struct with a missing element", sPair, "0e 1f 03 05", new(Pair), nil)
	invalid("C6 bytes in a pack", sBytes, "0e 2f 03 13 00 01", new([]byte), nil)

	// C7: keys are sorted and unique
	invalid("C7 map keys not sorted", sMap(sString, sInt), "0e 4f 06 13 26 33 62 02 61 01", new(map[string]uint64), nil)
	invalid("C7 map key two times", sMap(sString, sInt), "0e 4f 06 13 26 33 61 01 61 02", new(map[string]uint64), nil)
	invalid("C7 map NaN key", sMap(sFloat, sInt), "0e 3f 07 83 01 7f f8 00 00 00 00 00 00 01", new(map[float64]uint64), nil)
	invalid("C7 map keys -0 and +0", sMap(sFloat, sInt),
		"0e 7f 07 83 01 97 01 93 02 80 00 00 00 00 00 00 00 01 00 00 00 00 00 00 00 00 01", new(map[float64]uint64), nil)
	invalid("C7 bytes keys not sorted", sMap(sBytes, sInt), "0e 4f 06 23 36 53 0a 01 01 09 01 01", new(map[[2]byte]uint64), nil)
	invalid("C7 bytes key two times", sMap(sBytes, sInt), "0e 4f 06 23 36 53 09 01 01 09 01 02", new(map[[2]byte]uint64), nil)
	invalid("C7 map key with no value", sMap(sString, sInt), "0e 3f 06 13 26 61 01 62", new(map[string]uint64), nil)
	invalid("C7 document keys not sorted", sDocument, "0d 4f 06 15 36 45 62 03 01 61 03 01", new(polo.Document), nil)
	invalid("C7 document key two times", sDocument, "0d 4f 06 15 36 45 61 03 01 61 03 02", new(polo.Document), nil)

	// Documents
	invalid("document value is a PosInt", sDocument, "0d 2f 06 13 05 01", new(polo.Document), nil)
	invalid("document value is a Null element", sDocument, "0d 2f 06 10 61", new(polo.Document), nil)
	invalid("document key is not UTF-8", sDocument, "0d 2f 06 15 ff 03 01", new(polo.Document), nil)
	invalid("struct from a document without DocStructs", sOneField, "0d 2f 06 15 41 03 05", new(struct{ A uint64 }), nil)
	invalid("struct field from a Null value", sOneField, "0d 2f 06 15 41 00", new(struct{ A uint64 }), docStructs)

	// Wire types
	invalid("PosInt into a string", sString, "03 61", new(string), nil)
	invalid("Word into a raw", sRaw, "06 61", new(polo.Raw), nil)
	invalid("Word into a float", sFloat, "06 3f f8 00 00 00 00 00 00", new(float64), nil)
	invalid("reserved wire type into a string", sString, "08", new(string), nil)
	invalid("Load into bytes", sBytes, "0f", new([]byte), nil)
	invalid("Document into a list", sInts, "0d 0f", new([]uint64), nil)
	invalid("Pack into an integer", sInt, "0e 0f", new(uint64), nil)

	// UTF-8 strings
	invalid("UTF-8 ff", sString, "06 ff", new(string), nil)
	invalid("UTF-8 truncated", sString, "06 c3", new(string), nil)
	invalid("UTF-8 overlong", sString, "06 c0 80", new(string), nil)
	invalid("UTF-8 surrogate", sString, "06 ed a0 80", new(string), nil)
	invalid("UTF-8 above U+10FFFF", sString, "06 f4 90 80 80", new(string), nil)

	// The Null rule
	invalid("Null into a bool", sBool, "00", new(bool), nil)
	invalid("Null into an integer", sInt, "00", new(uint64), nil)
	invalid("Null into a float", sFloat, "00", new(float64), nil)
	invalid("Null into a string", sString, "00", new(string), nil)
	invalid("Null into a struct", sOneField, "00", new(struct{ A uint64 }), nil)
	invalid("Null item into a list of integers", sInts, "0e 3f 03 10 13 01 03", new([]uint64), nil)
	invalid("Null value into a map of integers", sMap(sString, sInt), "0e 2f 06 10 61", new(map[string]uint64), nil)

	module := "github.com/sarvalabs/go-polo (version unknown)"
	if info, ok := debug.ReadBuildInfo(); ok {
		for _, dep := range info.Deps {
			if dep.Path == "github.com/sarvalabs/go-polo" {
				module = dep.Path + " " + dep.Version
			}
		}
	}

	file := File{
		Comment: "Generated by scripts/gen-vectors. Do not edit this file by hand.",
		GoPolo:  module,
		Vectors: vectors,
	}

	encoder := json.NewEncoder(os.Stdout)
	encoder.SetIndent("", "\t")
	encoder.SetEscapeHTML(false)

	if err := encoder.Encode(file); err != nil {
		fail("cannot write the JSON: %v", err)
	}
}
