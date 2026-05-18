import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';
import API_BASE_URL from '../../config/api';

export default function ReadingMaterial() {
  const { materialId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useAuthStore();
  const [completed, setCompleted] = useState(false);
  
  // Get reading data and context from navigation state
  const reading = location.state?.reading || {
    title: 'Reading Material',
    content: 'Content not available'
  };
  const contentContext = location.state;

  useEffect(() => {
    // Mark as viewed after 30 seconds
    const timer = setTimeout(() => {
      setCompleted(true);
    }, 30000);

    return () => clearTimeout(timer);
  }, []);

  const markAsComplete = async () => {
    setCompleted(true);
    
    // Mark as complete in learning path
    if (contentContext && contentContext.pathId) {
      try {
        await axios.post(
          `${API_BASE_URL}/user-progress/${contentContext.pathId}/complete`,
          {
            contentType: 'reading',
            contentId: reading.title,
            moduleIndex: contentContext.moduleIndex,
            contentIndex: contentContext.contentIndex
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (error) {
        console.error('Error marking reading complete:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 transition"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Course
          </button>
          {completed && (
            <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Completed
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <article className="bg-white rounded-lg shadow-md p-8 md:p-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">{reading.title}</h1>
          
          <div className="prose prose-lg max-w-none">
            {reading.title === 'JavaScript History and Evolution' && (
              <>
                <h2>The Birth of JavaScript</h2>
                <p>
                  JavaScript was created in 1995 by Brendan Eich while he was working at Netscape Communications. 
                  Originally developed in just 10 days, it was initially called Mocha, then LiveScript, before 
                  finally being renamed to JavaScript.
                </p>

                <h2>Early Years (1995-2005)</h2>
                <p>
                  In its early days, JavaScript was primarily used for simple form validation and creating 
                  dynamic effects on web pages. The language was standardized as ECMAScript in 1997, which 
                  helped ensure consistency across different browsers.
                </p>

                <h2>The AJAX Revolution (2005)</h2>
                <p>
                  The introduction of AJAX (Asynchronous JavaScript and XML) marked a turning point. Google 
                  Maps and Gmail demonstrated that JavaScript could power sophisticated web applications, 
                  leading to the Web 2.0 era.
                </p>

                <h2>Modern JavaScript (2015-Present)</h2>
                <p>
                  ES6 (ECMAScript 2015) brought massive improvements including:
                </p>
                <ul>
                  <li>Arrow functions for cleaner syntax</li>
                  <li>Classes for object-oriented programming</li>
                  <li>Promises for better async handling</li>
                  <li>Template literals for string interpolation</li>
                  <li>Destructuring for easier data extraction</li>
                  <li>Modules for better code organization</li>
                </ul>

                <h2>JavaScript Today</h2>
                <p>
                  Today, JavaScript is everywhere:
                </p>
                <ul>
                  <li><strong>Frontend:</strong> React, Vue, Angular</li>
                  <li><strong>Backend:</strong> Node.js, Deno</li>
                  <li><strong>Mobile:</strong> React Native, Ionic</li>
                  <li><strong>Desktop:</strong> Electron</li>
                  <li><strong>IoT:</strong> Johnny-Five</li>
                </ul>

                <h2>The Future</h2>
                <p>
                  JavaScript continues to evolve with annual ECMAScript updates. New features like optional 
                  chaining, nullish coalescing, and top-level await make the language more powerful and 
                  developer-friendly.
                </p>
              </>
            )}

            {reading.title === 'Function Best Practices' && (
              <>
                <h2>Writing Clean Functions</h2>
                <p>
                  Functions are the building blocks of JavaScript applications. Following best practices 
                  ensures your code is maintainable, testable, and easy to understand.
                </p>

                <h2>1. Keep Functions Small and Focused</h2>
                <p>
                  Each function should do one thing and do it well. This makes your code easier to test, 
                  debug, and reuse.
                </p>
                <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
{`// Bad: Function does too much
function processUser(user) {
  validateUser(user);
  saveToDatabase(user);
  sendEmail(user);
  updateCache(user);
}

// Good: Separate concerns
function processUser(user) {
  if (!isValidUser(user)) return false;
  return saveUser(user);
}`}
                </pre>

                <h2>2. Use Descriptive Names</h2>
                <p>
                  Function names should clearly describe what they do. Use verbs for actions.
                </p>
                <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
{`// Bad
function data(u) { }

// Good
function getUserData(userId) { }`}
                </pre>

                <h2>3. Limit Parameters</h2>
                <p>
                  Functions with too many parameters are hard to use. Consider using an options object 
                  for functions with more than 3 parameters.
                </p>
                <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
{`// Bad
function createUser(name, email, age, address, phone, role) { }

// Good
function createUser({ name, email, age, address, phone, role }) { }`}
                </pre>

                <h2>4. Avoid Side Effects</h2>
                <p>
                  Pure functions that don't modify external state are easier to test and reason about.
                </p>

                <h2>5. Return Early</h2>
                <p>
                  Handle edge cases and errors early to reduce nesting and improve readability.
                </p>
                <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
{`// Bad
function processData(data) {
  if (data) {
    if (data.length > 0) {
      // process data
    }
  }
}

// Good
function processData(data) {
  if (!data || data.length === 0) return;
  // process data
}`}
                </pre>
              </>
            )}

            {reading.title === 'ES6+ Feature Guide' && (
              <>
                <h2>Modern JavaScript Features</h2>
                <p>
                  ES6 and beyond introduced many features that make JavaScript more powerful and enjoyable to write.
                </p>

                <h2>Arrow Functions</h2>
                <p>Shorter syntax for function expressions with lexical this binding.</p>
                <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
{`// Traditional function
const add = function(a, b) {
  return a + b;
};

// Arrow function
const add = (a, b) => a + b;`}
                </pre>

                <h2>Destructuring</h2>
                <p>Extract values from arrays or properties from objects.</p>
                <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
{`// Array destructuring
const [first, second] = [1, 2, 3];

// Object destructuring
const { name, age } = { name: 'John', age: 30 };`}
                </pre>

                <h2>Template Literals</h2>
                <p>String interpolation and multi-line strings.</p>
                <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
{`const name = 'World';
const greeting = \`Hello, \${name}!\`;`}
                </pre>

                <h2>Spread Operator</h2>
                <p>Expand arrays or objects.</p>
                <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
{`const arr1 = [1, 2, 3];
const arr2 = [...arr1, 4, 5];

const obj1 = { a: 1, b: 2 };
const obj2 = { ...obj1, c: 3 };`}
                </pre>

                <h2>Async/Await</h2>
                <p>Write asynchronous code that looks synchronous.</p>
                <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
{`async function fetchData() {
  try {
    const response = await fetch('/api/data');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
  }
}`}
                </pre>

                <h2>Optional Chaining</h2>
                <p>Safely access nested properties.</p>
                <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
{`const user = { profile: { name: 'John' } };
const name = user?.profile?.name; // 'John'
const age = user?.profile?.age; // undefined`}
                </pre>
              </>
            )}

            {!['JavaScript History and Evolution', 'Function Best Practices', 'ES6+ Feature Guide'].includes(reading.title) && (
              <p className="text-gray-600">
                This reading material is being prepared. Please check back later for the complete content.
              </p>
            )}
          </div>

          {/* Mark as Complete Button */}
          {!completed && (
            <div className="mt-8 pt-8 border-t border-gray-200">
              <button
                onClick={markAsComplete}
                className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
              >
                Mark as Complete
              </button>
            </div>
          )}
        </article>

        {/* Navigation */}
        {completed && (
          <div className="mt-6 flex justify-between">
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
            >
              ← Back to Course
            </button>
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
            >
              Continue →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
