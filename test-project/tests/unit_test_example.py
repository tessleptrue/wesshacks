import unittest

class TestStringMethods(unittest.TestCase):

    def test_upper(self):
        # Test if upper() works as expected.
        # We expect the two strings being equal.
        self.assertEqual('fries'.upper(), 'FRIES')

    def test_isupper(self):
        # Test if isupper() works as expected.
        self.assertTrue('FRIES'.isupper())
        self.assertFalse('Fries'.isupper())

    def test_split(self):
        # Test the split() string function.
        # If no separator is specified, the default is that a string is separated
        # at any whitespace. So, 'hello fries' will be split into an array with
        # two elements, i.e., ['hello', 'fries']
        s = 'hello fries'
        self.assertEqual(s.split(), ['hello', 'fries'])
        # If you would make it fail, a TypeError would be raised.
        with self.assertRaises(TypeError):
            s.split(2)

# Start the unittests.
# Side note: if __name__ == "__main__" is boilerplate code that protects users
# from accidentally invoking the script when they didn't intend to.
# https://stackoverflow.com/questions/419163/what-does-if-name-main-do
# In Python, the special name __main__ is used to refer to the top-level
# environment of a program.
# The __name__ variable points to the namespace wherever the Python interpreter
# happens to be at the moment. Inside an imported module, it's the name of that
# module. Inside the primary module or the terminal you are running everything
# from its "__main__". Given the "if" our code will only execute if run as the
# primary module.
if __name__ == '__main__':
    unittest.main()