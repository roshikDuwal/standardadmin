import { Helmet } from 'react-helmet-async';
import { Formik } from 'formik';
import { filter } from 'lodash';
import { sentenceCase } from 'change-case';
import { useEffect, useState } from 'react';
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
// @mui
import {
  Card,
  Table,
  Stack,
  Paper,
  Avatar,
  Button,
  Popover,
  Checkbox,
  TableRow,
  MenuItem,
  TableBody,
  TableCell,
  Container,
  Typography,
  IconButton,
  TableContainer,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  TextField,
  DialogActions,
  FormControl,
  Input,
} from '@mui/material';
// components
import Label from '../components/label';
import Iconify from '../components/iconify';
import Scrollbar from '../components/scrollbar';
// sections
import { SliderListHead, SliderListToolbar } from '../sections/@dashboard/slider';
import { addSlider, getSlider, deleteSlider, updateSlider } from '../services/slider';
import { error, success } from 'src/utils/toast';
import { SLIDER_BASE_URL } from 'src/config';
// mock
// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'id', label: 'Id', alignRight: false },
  { id: 'title', label: 'Title', alignRight: false },
  { id: 'image', label: 'Image', alignRight: false },
  { id: 'order', label: 'Order', alignRight: false },
  { id: 'active', label: 'Active', alignRight: false },
  { id: 'created_at', label: 'Created At', alignRight: false },
  { id: 'updated_at', label: 'Updated At', alignRight: false },
  { id: '' },
];

// ----------------------------------------------------------------------

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function applySortFilter(array, comparator, query) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  if (query) {
    return filter(array, (_slider) => _slider.name.toLowerCase().indexOf(query.toLowerCase()) !== -1);
  }
  return stabilizedThis.map((el) => el[0]);
}

export default function SliderPage() {
    const [open, setOpen] = useState(null);
    const [sliderlist, setSliderlist] = useState([]);

  const [openAdd, setOpenAdd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [actionSlider, setActionSlider] = useState();
    const [images, setImages] = useState([]);
    const [edit, setEdit] = useState(false);

  const handleClickOpen = () => {
    setOpenAdd(true);
  };

  const handleClose = () => {
    setEdit(false);
    setImages([]);
    setOpenAdd(false);
  };

  const blobToBase64 = async (url) => {
    return new Promise((resolve, _) => {
      var img = new Image();
      img.src = url;
      img.onload = () => {
        var myCanvas = document.createElement("canvas");
        var ctx = myCanvas.getContext("2d");
        myCanvas.width = img.width
        myCanvas.height = img.height
        ctx.drawImage(img, 0, 0);
        resolve(myCanvas.toDataURL());
      };
    });
  };

  const handleSelectedFile = async (e) => {
    const files = e.target.files;
    const imagesTmp = [];
    for (var i = 0; i < files.length; i++) {
      const base64 = await blobToBase64(URL.createObjectURL(files[i]));

      imagesTmp.push({
        file: base64,
        score: null,
        title:
          files[i].name.substring(0, files[i].name.lastIndexOf(".")),
      });
    }
    imagesTmp.sort((a, b) => {
      return a.title.localeCompare(b.title, undefined, {
        numeric: true,
        sensitivity: "base",
      });
    });
    setImages(imagesTmp);
    e.target.value = null;
  };

  const [page, setPage] = useState(0);

  const [order, setOrder] = useState('asc');

  const [selected, setSelected] = useState([]);

  const [orderBy, setOrderBy] = useState('name');

  const [filterName, setFilterName] = useState('');

  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleOpenMenu = (event) => {
    setOpen(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpen(null);
  };

  const deleteConfirm = (e) => {
    e.stopPropagation();
    handleCloseMenu();
    confirmAlert({
      title: "Are you sure to delete slider?",
      message: "The data will be lost forever.",
      buttons: [
        {
          label: "Delete",
          onClick: async () => {
            setLoading(true);
            try {
                await deleteSlider(actionSlider?.id)
                success("Slider deleted successfully")
                await getData();
            } catch (e) {
                error(e.message || "Failed to delete slider")
            }
            setLoading(false);
          },
        },
        {
          label: "Cancel",
          onClick: () => {},
        },
      ],
    });
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = sliderlist.map((n) => n.name);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
    }
    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  const handleFilterByName = (event) => {
    setPage(0);
    setFilterName(event.target.value);
  };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - sliderlist.length) : 0;

  const filteredSliders = applySortFilter(sliderlist, getComparator(order, orderBy), filterName);

  const isNotFound = !filteredSliders.length && !!filterName;

  const getData = async ()=>{
    setLoading(true);
    try {
        const sliders = await getSlider();
        setSliderlist(sliders)
    } catch (e) {
        error(e.message || "Failed to get sliders")
    }
    setLoading(false)
    }

  useEffect(() => {
    getData();
  },[])

  return (
    <>
      <Helmet>
        <title> Slider | Standard Computer International </title>
      </Helmet>

      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Sliders
          </Typography>
          <Button variant="contained" onClick={handleClickOpen} startIcon={<Iconify icon="eva:plus-fill" />}>
            New Slider
          </Button>
        </Stack>

        <Card>
          <SliderListToolbar numSelected={selected.length} filterName={filterName} onFilterName={handleFilterByName} />

          <Scrollbar>
            <TableContainer sx={{ minWidth: 800 }}>
              <Table>
                <SliderListHead
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={sliderlist.length}
                  numSelected={selected.length}
                  onRequestSort={handleRequestSort}
                  onSelectAllClick={handleSelectAllClick}
                />
                <TableBody>
                  {filteredSliders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                    const { id, title, order, active, image, created_at, updated_at } = row;
                    const selectedSlider = selected.indexOf(name) !== -1;

                    return (
                      <TableRow hover key={id} tabIndex={-1} role="checkbox" selected={selectedSlider}>
                        <TableCell padding="checkbox">
                          <Checkbox checked={selectedSlider} onChange={(event) => handleClick(event, name)} />
                        </TableCell>
                        <TableCell align="left">{id.toString()}</TableCell>

                        <TableCell component="th" scope="row">
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Typography variant="subtitle2" noWrap>
                              {title}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell component="th" scope="row">
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <img src={SLIDER_BASE_URL+image} alt={title} style={{width:"18rem"}} />
                          </Stack>
                        </TableCell>

                        <TableCell component="th" scope="row">
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Typography variant="subtitle2" noWrap>
                              {order}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell component="th" scope="row">
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Typography variant="subtitle2" noWrap>
                              {active ? "Active" : "Inactive"}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell align="left">{new Date(created_at).toLocaleDateString()}</TableCell>

                        <TableCell align="left">{new Date(updated_at).toLocaleDateString() || "-"}</TableCell>

                        <TableCell align="right">
                          <IconButton size="large" color="inherit" onClick={(e)=>{
                            setActionSlider({...row})
                            handleOpenMenu(e)}}>
                            <Iconify icon={'eva:more-vertical-fill'} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {loading && (
                   <TableRow>
                     <TableCell align="center" colSpan={6} sx={{ py: 3 }}>
                       <Paper
                         sx={{
                           textAlign: 'center',
                         }}
                       >
                         <Typography variant="h6" paragraph>
                           Loading...
                         </Typography>
                       </Paper>
                     </TableCell>
                   </TableRow>
                  )}
                  {emptyRows > 0  && !loading && (
                    <TableRow style={{ height: 53 * emptyRows }}>
                      <TableCell colSpan={6} />
                    </TableRow>
                  )}
                  {sliderlist.length === 0 && !loading && !isNotFound && (
                   <TableRow>
                     <TableCell align="center" colSpan={6} sx={{ py: 3 }}>
                       <Paper
                         sx={{
                           textAlign: 'center',
                         }}
                       >
                         <Typography variant="h6" paragraph>
                           No Data
                         </Typography>
                         <Typography variant="body2">
                            No records found
                          </Typography>
                       </Paper>
                     </TableCell>
                   </TableRow>
                  )}
                </TableBody>

                {isNotFound && (
                  <TableBody>
                    <TableRow>
                      <TableCell align="center" colSpan={6} sx={{ py: 3 }}>
                        <Paper
                          sx={{
                            textAlign: 'center',
                          }}
                        >
                          <Typography variant="h6" paragraph>
                            Not found
                          </Typography>

                          <Typography variant="body2">
                            No results found for &nbsp;
                            <strong>&quot;{filterName}&quot;</strong>.
                            <br /> Try checking for typos or using complete words.
                          </Typography>
                        </Paper>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                )}
              </Table>
            </TableContainer>
          </Scrollbar>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={sliderlist.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>
      </Container>

      <Popover
        open={Boolean(open)}
        anchorEl={open}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            p: 1,
            width: 140,
            '& .MuiMenuItem-root': {
              px: 1,
              typography: 'body2',
              borderRadius: 0.75,
            },
          },
        }}
      >
        <MenuItem  onClick={()=>{handleCloseMenu();setEdit(true)}}>
          <Iconify icon={'eva:edit-fill'} sx={{ mr: 2 }} />
          Edit
        </MenuItem>

        <MenuItem sx={{ color: 'error.main' }} onClick={deleteConfirm}>
          <Iconify icon={'eva:trash-2-outline'} sx={{ mr: 2 }} />
          Delete
        </MenuItem>
      </Popover>
      <Dialog open={openAdd || edit} onClose={handleClose}>
        <Formik
          initialValues={edit ? actionSlider : { title: '' }}
          validate={(values) => {
            const errors = {};
            if (!values.title) {
              errors.title = 'Required';
            }
            return errors;
          }}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              if(!images.length) {
                return;
              }
              const image = images[0].file;
              if(edit) {
                await updateSlider(actionSlider.id, {...values, image})
                success("Slider updated successfully")
              } else {
                await addSlider({...values, image});
                success("Slider added successfully")
              }
                getData();

            handleClose();

            } catch (e) {
              if(edit) {
                error(e.message || "Failed to update slider")
              } else {
                error(e.message || "Failed to add slider")
              }
            }
            setSubmitting(false);
          }}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            handleSubmit,
            isSubmitting,
            /* and other goodies */
          }) => (
            <form onSubmit={handleSubmit}>
              <DialogTitle>{edit ? "Edit Slider" : "Add Slider"}</DialogTitle>
              <DialogContent>
                {/* <DialogContentText>
            To subscribe to this website, please enter your name address here. We
            will send updates occasionally.
          </DialogContentText> */}
                <TextField
                  autoFocus
                  margin="dense"
                  id="name"
                  label="Slider name"
                  type="text"
                  fullWidth
                  name="title"
                  variant="standard"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.title}
                />
              {errors.title && touched.title && errors.title}
              <FormControl style={{width: "100%", marginTop: '0.5rem'}}> 
                  Image
        <Input type="file" id="images" onChange={handleSelectedFile} />
        {images.length ? (
              <div className="flex-container">
                {images.map((imgData, i) => (
                  <div className="img-box" key={i}>
                    <img src={imgData.file} alt={imgData.title} />
                    <div className="flex-container">
                      <Button
                        onClick={() => {
                          const imagesTmp = [...images];
                          imagesTmp.splice(i, 1);
                          setImages(imagesTmp);
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
                </FormControl>
                <TextField
                  autoFocus
                  margin="dense"
                  id="name"
                  label="Order"
                  type="number"
                  fullWidth
                  name="order"
                  variant="standard"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.order}
                />
              {errors.order && touched.order && errors.order}
              </DialogContent>
              <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button disabled={isSubmitting} type='submit'>{edit ? "Edit" : "Add"}</Button>
              </DialogActions>
            </form>
          )}
        </Formik>
      </Dialog>
    </>
  );
}
