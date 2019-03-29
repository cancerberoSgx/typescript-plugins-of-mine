import { getSupportedCodeFixes } from "typescript";
import { getAllSupportedCodeFixeDefinitions } from '../src/supportedCodeFixes';
import { writeFileSync } from 'fs';

describe('first', () => {
  it('should 1', () => {
    expect(getAllSupportedCodeFixeDefinitions().length).toBeGreaterThan(0)
    getAllSupportedCodeFixeDefinitions().forEach(d => {
      expect(getSupportedCodeFixes().includes(d.code + ''))
    })

    writeFileSync('all.txt', JSON.stringify(getAllSupportedCodeFixeDefinitions(), null, 2));
    
  })
})