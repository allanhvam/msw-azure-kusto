import assert from 'node:assert';
import test from 'node:test';

import * as antlr from 'antlr4ng';

import { KqlLexer } from '../parser/KqlLexer.js';
import { KqlParser } from '../parser/KqlParser.js';

test('parses join on-clause with $left/$right path expressions', () => {
  const query =
    'Meetings | join kind=leftouter (Meetings) on $left.seriesMasterId == $right.id | project id, id1';

  const lexer = new KqlLexer(antlr.CharStream.fromString(query));
  const tokens = new antlr.CommonTokenStream(lexer);
  const parser = new KqlParser(tokens);
  const top = parser.top();

  assert.ok(top.query());
  assert.equal(parser.numberOfSyntaxErrors, 0);
});

test('parses join on-clause with multiple $left/$right predicates', () => {
  const query =
    'Meetings | join kind=leftouter (Meetings) on $left.seriesMasterId == $right.id, $left.user == $right.user | project id, id1';

  const lexer = new KqlLexer(antlr.CharStream.fromString(query));
  const tokens = new antlr.CommonTokenStream(lexer);
  const parser = new KqlParser(tokens);
  const top = parser.top();

  assert.ok(top.query());
  assert.equal(parser.numberOfSyntaxErrors, 0);
});

test('parses management command with table token', () => {
  const query = '.create table Events';

  const lexer = new KqlLexer(antlr.CharStream.fromString(query));
  const tokens = new antlr.CommonTokenStream(lexer);
  const parser = new KqlParser(tokens);
  const top = parser.top();

  assert.ok(top.query());
  assert.equal(parser.numberOfSyntaxErrors, 0);
});

test('parses show database management command', () => {
  const query = '.show database';

  const lexer = new KqlLexer(antlr.CharStream.fromString(query));
  const tokens = new antlr.CommonTokenStream(lexer);
  const parser = new KqlParser(tokens);
  const top = parser.top();

  assert.ok(top.query());
  assert.equal(parser.numberOfSyntaxErrors, 0);
});

test('parses show tables management command', () => {
  const query = '.show tables';

  const lexer = new KqlLexer(antlr.CharStream.fromString(query));
  const tokens = new antlr.CommonTokenStream(lexer);
  const parser = new KqlParser(tokens);
  const top = parser.top();

  assert.ok(top.query());
  assert.equal(parser.numberOfSyntaxErrors, 0);
});

test('parses create table command with scalar column types', () => {
  const query = '.create table Events (Id:int, Value:real)';

  const lexer = new KqlLexer(antlr.CharStream.fromString(query));
  const tokens = new antlr.CommonTokenStream(lexer);
  const parser = new KqlParser(tokens);
  const top = parser.top();

  assert.ok(top.query());
  assert.equal(parser.numberOfSyntaxErrors, 0);
});

test('parses create-or-alter table command', () => {
  const query = '.create-or-alter table Events';

  const lexer = new KqlLexer(antlr.CharStream.fromString(query));
  const tokens = new antlr.CommonTokenStream(lexer);
  const parser = new KqlParser(tokens);
  const top = parser.top();

  assert.ok(top.query());
  assert.equal(parser.numberOfSyntaxErrors, 0);
});

test('parses ingest inline command marker', () => {
  const query = '.ingest inline into table Events <| 1,10';

  const lexer = new KqlLexer(antlr.CharStream.fromString(query));
  const tokens = new antlr.CommonTokenStream(lexer);
  const parser = new KqlParser(tokens);
  const top = parser.top();

  assert.ok(top.query());
  assert.equal(parser.numberOfSyntaxErrors, 0);
});

test('parses ingest inline command with with-clause', () => {
  const query = '.ingest inline into table Events with (format = "json") <| {"Id":1,"Value":10}';

  const lexer = new KqlLexer(antlr.CharStream.fromString(query));
  const tokens = new antlr.CommonTokenStream(lexer);
  const parser = new KqlParser(tokens);
  const top = parser.top();

  assert.ok(top.query());
  assert.equal(parser.numberOfSyntaxErrors, 0);
});

test('parses ingest from uri command', () => {
  const query = ".ingest into table StormEvents ('https://kustosamples.blob.core.windows.net/samplefiles/StormEvents.csv')";

  const lexer = new KqlLexer(antlr.CharStream.fromString(query));
  const tokens = new antlr.CommonTokenStream(lexer);
  const parser = new KqlParser(tokens);
  const top = parser.top();

  assert.ok(top.query());
  assert.equal(parser.numberOfSyntaxErrors, 0);
});

test('parses ingest from uri command with with-clause', () => {
  const query = ".ingest into table StormEvents ('https://kustosamples.blob.core.windows.net/samplefiles/StormEvents.csv') with (format='csv', ignoreFirstRecord=true)";

  const lexer = new KqlLexer(antlr.CharStream.fromString(query));
  const tokens = new antlr.CommonTokenStream(lexer);
  const parser = new KqlParser(tokens);
  const top = parser.top();

  assert.ok(top.query());
  assert.equal(parser.numberOfSyntaxErrors, 0);
});

test('parses declare query_parameters statement with defaults', () => {
  const query =
    'declare query_parameters(startDate:datetime, eventType:string = "Flood", maxRows:long = 5); StormEvents | where StartTime >= startDate and EventType == eventType | take maxRows';

  const lexer = new KqlLexer(antlr.CharStream.fromString(query));
  const tokens = new antlr.CommonTokenStream(lexer);
  const parser = new KqlParser(tokens);
  const top = parser.top();

  assert.ok(top.query());
  assert.equal(parser.numberOfSyntaxErrors, 0);
});
