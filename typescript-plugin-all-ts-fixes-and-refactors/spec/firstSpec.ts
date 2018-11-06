import { getSupportedCodeFixes } from "typescript";
import { getAllSupportedCodeFixeDefinitions } from '../src/supportedCodeFixes';

describe('first', () => {
  it('should 1', () => {
    expect(getAllSupportedCodeFixeDefinitions().length).toBeGreaterThan(0)
    getAllSupportedCodeFixeDefinitions().forEach(d => {
      expect(getSupportedCodeFixes().includes(d.code + ''))
    })
  })
})