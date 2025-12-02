import {toHex, encodePacked, keccak256} from 'viem';
import {MerkleTree} from 'merkletreejs';

const users = [
    {address: '0x1234567890abcdef1234567890abcdef12345678', amount: BigInt(100)},
    {address: '0xabcdef1234567890abcdef1234567890abcdef12', amount: BigInt(200)},
    {address: '0x7890abcdef1234567890abcdef1234567890abcd', amount: BigInt(300)},
]

const elements = users.map(user => {
    return keccak256(encodePacked(
        ['address', 'uint256'],
        [user.address as `0x${string}`, user.amount]
    ));
})

console.log('elements:', elements);

const merkleTree = new MerkleTree(elements, keccak256, {sortPairs: true});

const root = merkleTree.getHexRoot();
console.log('merkle root:', root);

const leaf = elements[0];
const proof = merkleTree.getHexProof(leaf);
console.log('merkle proof for first user:', proof);

const isValid = merkleTree.verify(proof, leaf, root);
console.log('is valid proof for first user:', isValid);

const invalidLeaf = keccak256(encodePacked(
    ['address', 'uint256'],
    ['0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef' as `0x${string}`, BigInt(999)]
));
const invalidProof = merkleTree.getHexProof(invalidLeaf);
const isInvalidValid = merkleTree.verify(invalidProof, invalidLeaf, root);
console.log('is valid proof for invalid user:', isInvalidValid);