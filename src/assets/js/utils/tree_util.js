/**
  * Created by hzzcc on 2017/11/28.
  * @fileoverview
  */
 'use strict';

 import cloneDeep from 'lodash/cloneDeep'
 
 class Node {
     constructor(data, children) {
         this.data = data;
         this.children = children || [];
     }
 }
 
 class Tree {
     constructor() {
         this.root = null;
     }
 
     add(data, toNodeData) {
         const node = data instanceof Node ? data : new Node(data);
         const parent = toNodeData ? this.findBFS(toNodeData) : null;
         if (parent) {
             parent.children.push(node);
         } else {
             if (!this.root) {
                 this.root = node;
             } else {
                 return 'Root node is already assigned';
             }
         }
     }
 
     addDeep(data, toNodeData) {
         var node = this.findBFS(toNodeData);
         var dnode = this.findBFS(data);
         if (!node && this.root) {
             this.add(toNodeData, this.root.data)
         }
         this.add(dnode ? cloneDeep(dnode) : data, toNodeData);
 
     }
 
     remove(data) {
         if (this.root.data === data) {
             this.root = null;
             return;
         }
 
         const queue = [this.root];
         while (queue.length) {
             const node = queue.shift();
             for (let i = 0; i < node.children.length; i++) {
                 if (node.children[i].data === data) {
                     node.children.splice(i, 1);
                 } else {
                     queue.push(node.children[i]);
                 }
             }
         }
     }
 
     contains(data) {
         return this.findBFS(data) ? true : false;
     }
 
     findBFS(data) {
         if (!this.root) return null;
         const queue = [this.root];
         while (queue.length) {
             const node = queue.shift();
             if (node && node.data === data) {
                 return node;
             }
             for (let i = 0; i < node.children.length; i++) {
                 queue.push(node.children[i]);
             }
         }
         return null;
     }
 
     _preOrder(node, fn) {
         if (node) {
             if (fn) {
                 fn(node);
             }
             for (let i = 0; i < node.children.length; i++) {
                 this._preOrder(node.children[i], fn);
             }
         }
     }
 
     _postOrder(node, fn) {
         if (node) {
             for (let i = 0; i < node.children.length; i++) {
                 this._postOrder(node.children[i], fn);
             }
             if (fn) {
                 fn(node);
             }
         }
     }
 
     traverseDFS(fn, method) {
         const current = this.root;
         if (method) {
             this[`_${method}`](current, fn);
         } else {
             this._preOrder(current, fn);
         }
     }
 
     traverseBFS(fn) {
         const queue = [this.root];
         while (queue.length) {
             const node = queue.shift();
             if (fn) {
                 fn(node);
             }
             for (let i = 0; i < node.children.length; i++) {
                 queue.push(node.children[i]);
             }
         }
     }
 
     print() {
         if (!this.root) {
             return console.log('No root node found');
         }
         const newline = new Node('|');
         const queue = [this.root, newline];
         let string = '';
         while (queue.length) {
             const node = queue.shift();
             string += `${node.data.toString()} `;
             if (node === newline && queue.length) {
                 queue.push(newline);
             }
             for (let i = 0; i < node.children.length; i++) {
                 queue.push(node.children[i]);
             }
         }
         console.log(string.slice(0, -2).trim());
     }
 
     printByLevel() {
         if (!this.root) {
             return console.log('No root node found');
         }
         const newline = new Node('\n');
         const queue = [this.root, newline];
         let string = '';
         while (queue.length) {
             const node = queue.shift();
             string += node.data.toString() + (node.data !== '\n' ? ' ' : '');
             if (node === newline && queue.length) {
                 queue.push(newline);
             }
             for (let i = 0; i < node.children.length; i++) {
                 queue.push(node.children[i]);
             }
         }
         console.log(string.trim());
     }
 }
 
 module.exports = {
     Tree,
     Node,
 }
 