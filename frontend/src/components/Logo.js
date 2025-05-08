import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { BarChart as BarChartIcon } from '@mui/icons-material';

const Logo = ({ size = 'medium', onClick }) => {
  const theme = useTheme();
  
  // Size variants
  const sizes = {
    small: {
      circle: 40,
      icon: 24,
      fontSize: '0.8rem'
    },
    medium: {
      circle: 50,
      icon: 30,
      fontSize: '1rem'
    },
    large: {
      circle: 60,
      icon: 36,
      fontSize: '1.2rem'
    }
  };
  
  const currentSize = sizes[size];
  
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        alignItems: 'center',
        gap: 1
      }}
    >
      <Box
        onClick={onClick}
        sx={{
          width: currentSize.circle,
          height: currentSize.circle,
          borderRadius: '50%',
          backgroundColor: theme.palette.primary.main,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 2,
          cursor: 'pointer',
          transition: 'transform 0.2s ease',
          '&:hover': {
            transform: 'scale(1.05)'
          }
        }}
      >
        <BarChartIcon 
          sx={{ 
            color: 'white',
            fontSize: currentSize.icon
          }} 
        />
      </Box>
    </Box>
  );
};

export default Logo; 