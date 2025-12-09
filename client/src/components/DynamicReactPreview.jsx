import React, { useEffect, useState } from 'react';
import * as Recharts from 'recharts';
import * as Lucide from 'lucide-react';
import * as Babel from '@babel/standalone';

const DynamicReactPreview = ({ code }) => {
  const [Component, setComponent] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!code) return;

    try {
      console.log("Raw Code from AI:", code);

      // 1. Strip imports (Robust Multiline support)
      // Matches import ... from '...'; handling newlines
      let cleanCode = code.replace(/import[\s\S]*?from\s+['"][^'"]+['"];?/g, '');
      
      // Remove any standalone "import 'lib';" style if exists (less common but possible)
      cleanCode = cleanCode.replace(/import\s+['"][^'"]+['"];?/g, '');

      console.log("Clean Code:", cleanCode);

      // 2. Transform "export default function Name" -> "return function Name" logic
      if (cleanCode.includes('export default')) {
        cleanCode = cleanCode.replace('export default', 'const _DefaultComp =');
        cleanCode += ';\nreturn _DefaultComp;';
      } else {
        cleanCode += ';\nreturn null;'; 
      }

      // 3. Transpile
      if (!Babel) {
        throw new Error("Babel is not loaded");
      }

      const compiled = Babel.transform(cleanCode, {
        presets: ['react', 'env'],
        filename: 'dynamic.js',
        parserOpts: { allowReturnOutsideFunction: true } // Allow top-level return for new Function() body
      }).code;

      // 4. Create Factory Function
      const scope = {
        React,
        useState: React.useState,
        useEffect: React.useEffect,
        useMemo: React.useMemo,
        useCallback: React.useCallback,
        useRef: React.useRef,
        Recharts, // Explicitly add Recharts object
        ...Recharts,
        ...Lucide
      };

      const scopeKeys = Object.keys(scope);
      const scopeValues = Object.values(scope);

      const func = new Function(...scopeKeys, compiled);
      const GeneratedComponent = func(...scopeValues);
      
      setComponent(() => GeneratedComponent);
      setError(null);
    } catch (err) {
      console.error("Dynamic Render Error:", err);
      setError(err.toString());
    }
  }, [code]);

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-red-700 text-sm font-mono whitespace-pre-wrap overflow-auto max-h-96">
        <strong>Render Error:</strong>
        <div className="mt-2">{error}</div>
        <details className="mt-4">
            <summary className="cursor-pointer font-bold">Raw Code</summary>
            <pre className="text-xs mt-2">{code}</pre>
        </details>
      </div>
    );
  }

  if (!Component) {
    return <div className="p-10 text-center text-gray-400">Loading Visualization...</div>;
  }

  return (
    <div className="w-full h-full min-h-[600px] bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden relative">
        <div className="w-full h-full overflow-auto p-4">
             <Component />
        </div>
    </div>
  );
};

export default DynamicReactPreview;
