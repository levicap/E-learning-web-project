import { useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { githubDark, githubLight } from '@uiw/codemirror-themes-all';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, Play, Copy, Check, Maximize, Minimize } from 'lucide-react';

// Map our supported languages to their details and Judge0 language IDs.
const languages = {
  javascript: { name: 'JavaScript', extension: 'js', lang: javascript(), judge0Id: 63 },
  python: { name: 'Python', extension: 'py', lang: python(), judge0Id: 71 },
  java: { name: 'Java', extension: 'java', lang: java(), judge0Id: 62 },
  cpp: { name: 'C++', extension: 'cpp', lang: cpp(), judge0Id: 54 }
};

interface CodeOutput {
  type: 'success' | 'error';
  content: string;
}

export function CodeEditor() {
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [output, setOutput] = useState<CodeOutput | null>(null);
  const [copied, setCopied] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [fullScreen, setFullScreen] = useState(false);

  const RAPIDAPI_KEY = "eafbca5e55msh54d6dec423d22dcp1d5327jsnadf012d343b5"; // Your actual key

  // Handler to copy the code to clipboard.
  const handleCopy = async () => {
    if (code) {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Download code as a file.
  const handleDownload = () => {
    if (code) {
      const blob = new Blob([code], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `code.${languages[language].extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  // Real compilation/execution using Judge0 API.
  const handleRun = async () => {
    setOutput({ type: 'success', content: 'Compiling and executing your code...' });
    try {
      const judge0Endpoint = "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=false";
      const languageId = languages[language].judge0Id;
      const requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
          "x-rapidapi-key": RAPIDAPI_KEY
        },
        body: JSON.stringify({
          source_code: code,
          language_id: languageId,
          // Optionally add stdin, command-line arguments, etc.
        }),
      };

      // Create a new submission.
      const submissionResponse = await fetch(judge0Endpoint, requestOptions);
      const submissionData = await submissionResponse.json();
      console.log("Submission Data:", submissionData);
      if (!submissionData.token) {
        throw new Error("No submission token received. Response: " + JSON.stringify(submissionData));
      }
      const token = submissionData.token;

      // Poll the result endpoint until execution is finished.
      let result: any = null;
      while (true) {
        const resultResponse = await fetch(`https://judge0-ce.p.rapidapi.com/submissions/${token}?base64_encoded=false`, {
          method: "GET",
          headers: {
            "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
            "x-rapidapi-key": RAPIDAPI_KEY
          },
        });
        result = await resultResponse.json();
        // Status IDs: 1 = In Queue, 2 = Processing, 3 = Accepted, >3 indicates finished (error or completed)
        if (result.status && (result.status.id === 3 || result.status.id > 3)) {
          break;
        }
        // Increase delay to 3 seconds to reduce rate limit issues
        await new Promise(resolve => setTimeout(resolve, 3000));
      }

      // Display the output.
      if (result.stdout) {
        setOutput({ type: 'success', content: result.stdout });
      } else if (result.stderr) {
        setOutput({ type: 'error', content: result.stderr });
      } else if (result.compile_output) {
        setOutput({ type: 'error', content: result.compile_output });
      } else {
        setOutput({ type: 'error', content: 'No output received.' });
      }
    } catch (error: any) {
      console.error(error);
      setOutput({ type: 'error', content: String(error) });
    }
  };

  // Toggle full screen mode.
  const toggleFullScreen = () => {
    setFullScreen(!fullScreen);
  };

  // The main editor content shared between normal and full screen mode.
  const editorContent = (
    <div className="space-y-4 h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-2 items-center">
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(languages).map(([value, { name }]) => (
                <SelectItem key={value} value={value}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={theme} onValueChange={(value: 'light' | 'dark') => setTheme(value)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={handleCopy}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Save
          </Button>
          <Button variant="default" size="sm" onClick={handleRun}>
            <Play className="mr-2 h-4 w-4" />
            Run
          </Button>
          <Button variant="outline" size="sm" onClick={toggleFullScreen}>
            {fullScreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Code Editor */}
      <div className="border rounded-lg overflow-hidden flex-grow">
        <CodeMirror
          value={code}
          height="400px"
          theme={theme === 'dark' ? githubDark : githubLight}
          extensions={[languages[language].lang]}
          onChange={(value) => setCode(value)}
          className="text-sm"
        />
      </div>

      {/* Code Output */}
      {output && (
        <Card className="p-4">
          <h3 className="text-sm font-medium mb-2">Output:</h3>
          <pre className={`text-sm p-2 rounded ${output.type === 'error' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
            {output.content}
          </pre>
        </Card>
      )}
    </div>
  );

  return (
    <>
      {fullScreen ? (
        // Full Screen Mode Overlay
        <div className="fixed inset-0 z-50 bg-gray-900 text-white p-4 overflow-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">Full Screen Code Editor</h2>
            <Button variant="outline" size="sm" onClick={toggleFullScreen}>
              <Minimize className="h-4 w-4" />
              Exit Full Screen
            </Button>
          </div>
          {editorContent}
        </div>
      ) : (
        // Normal Mode
        <div className="space-y-4">
          {editorContent}
        </div>
      )}
    </>
  );
}

export default CodeEditor;
