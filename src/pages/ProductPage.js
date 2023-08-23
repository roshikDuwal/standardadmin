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
  Select,
  InputLabel,
  FormControl,
  Input,
} from '@mui/material';
// components
import Label from '../components/label';
import Iconify from '../components/iconify';
import Scrollbar from '../components/scrollbar';
// sections
import { ProductListHead, ProductListToolbar } from '../sections/@dashboard/product';
import { addProduct, deleteProduct, getProduct, updateProduct } from '../services/product';
import { error, success } from 'src/utils/toast';
import { getBrand } from 'src/services/brand';
import { getCategory } from 'src/services/category';
import { PRODUCT_IMAGE_PATH } from 'src/config';
// mock
// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'id', label: 'Id', alignRight: false },
  { id: 'title', label: 'Name', alignRight: false },
  { id: 'brand_id', label: 'Brand', alignRight: false },
  { id: 'categories', label: 'Categories', alignRight: false },
  { id: 'description', label: 'Description', alignRight: false },
  { id: 'quantity', label: 'Stock', alignRight: false },
  { id: 'regular_price', label: 'Regular Price', alignRight: false },
  { id: 'discount_price', label: 'Discount Price', alignRight: false },
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
    return filter(array, (_product) => _product.title.toLowerCase().indexOf(query.toLowerCase()) !== -1);
  }
  return stabilizedThis.map((el) => el[0]);
}

export default function ProductPage() {
    const [open, setOpen] = useState(null);
    const [productlist, setProductlist] = useState([]);
    const [categorylist, setCategorylist] = useState([]);
    const [brandlist, setBrandlist] = useState([]);
    const [actionProduct, setActionProduct] = useState();
    const [edit, setEdit] = useState(false);
    const [features, setFeatures] = useState([{name:"", description:""}]);

    const [openAdd, setOpenAdd] = useState(false);
    const [loading, setLoading] = useState(false);
    const [images, setImages] = useState([]);

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
    const imagesTmp = [...images];
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

  const handleClickOpen = () => {
    setOpenAdd(true);
  };

  const handleClose = () => {
    setImages([]);
    setFeatures([{name:"", description:""}])
    setOpenAdd(false);
    setEdit(false);
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

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = productlist.map((n) => n.title);
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

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - productlist.length) : 0;

  const filteredProducts = applySortFilter(productlist, getComparator(order, orderBy), filterName);

  const isNotFound = !filteredProducts.length && !!filterName;

  const getData = async ()=>{
    setLoading(true);
    try {
        const products = await getProduct();
        setProductlist(products)
        const brands = await getBrand();
        setBrandlist(brands.map(brand => ({label:brand.name, value: brand.id})))
        const categories = await getCategory();
        setCategorylist(categories.map(category => ({label:category.title, value: category.id})))
    } catch (e) {
        error(e.message || "Failed to get products")
    }
    setLoading(false)
    }

  useEffect(() => {
    getData();
  },[])

  const deleteConfirm = (e) => {
    e.stopPropagation();
    handleCloseMenu();
    confirmAlert({
      title: "Are you sure to delete product?",
      message: "The data will be lost forever.",
      buttons: [
        {
          label: "Delete",
          onClick: async () => {
            setLoading(true);
            try {
                await deleteProduct(actionProduct?.id)
                success("Product deleted successfully")
                await getData();
            } catch (e) {
                error(e.message || "Failed to delete product")
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

  const getBase64FromUrl = async (url) => {
    const data = await fetch(url);
    const blob = await data.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob); 
      reader.onloadend = () => {
        const base64data = reader.result;   
        resolve(base64data);
      }
    });
  }

  return (
    <>
      <Helmet>
        <title> Product | Standard Computer International </title>
      </Helmet>

      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Products
          </Typography>
          <Button variant="contained" onClick={handleClickOpen} startIcon={<Iconify icon="eva:plus-fill" />}>
            New Product
          </Button>
        </Stack>

        <Card>
          <ProductListToolbar numSelected={selected.length} filterName={filterName} onFilterName={handleFilterByName} />

          <Scrollbar>
            <TableContainer sx={{ minWidth: 800 }}>
              <Table>
                <ProductListHead
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={productlist.length}
                  numSelected={selected.length}
                  onRequestSort={handleRequestSort}
                  onSelectAllClick={handleSelectAllClick}
                />
                <TableBody>
                  {filteredProducts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                    const { id, title, description, brand_id, categories, quantity, regular_price,discount_price, created_at, updated_at } = row;
                    const selectedProduct = selected.indexOf(name) !== -1;

                    return (
                      <TableRow hover key={id} tabIndex={-1} role="checkbox" selected={selectedProduct}>
                        <TableCell padding="checkbox">
                          <Checkbox checked={selectedProduct} onChange={(event) => handleClick(event, name)} />
                        </TableCell>
                        <TableCell align="left">{id.toString()}</TableCell>

                        <TableCell component="th" scope="row" padding="normal">
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Typography variant="subtitle2" >
                              {title}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell component="th" scope="row" padding="normal">
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Typography variant="subtitle2" noWrap>
                              {brandlist.map(brand => {
                                if(brand.value===brand_id) {
                                  return brand.label
                                }
                              })}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell component="th" scope="row" padding="normal">
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Typography variant="subtitle2" >
                            {categories.map(cat=>cat.title).join(",")}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell component="th" scope="row" padding="normal">
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Typography variant="subtitle2" >
                              {description}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell component="th" scope="row" padding="normal">
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Typography variant="subtitle2" noWrap>
                              {quantity}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell component="th" scope="row" padding="normal">
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Typography variant="subtitle2" noWrap>
                              {regular_price}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell component="th" scope="row" padding="normal">
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Typography variant="subtitle2" noWrap>
                              {discount_price}
                            </Typography>
                          </Stack>
                        </TableCell>

                        <TableCell align="right">
                          <IconButton size="large" color="inherit" onClick={async (e)=>{
                            const categories = row.categories?.map(cat=>cat.id)
                            // setImages(row.images)
                            setFeatures(row.product_features)
                            setActionProduct({...row, categories})
                            handleOpenMenu(e)
                            const imagesTmp = [];
                            for (var i = 0; i < row.images.length; i++) {
                              const base64 = await getBase64FromUrl(PRODUCT_IMAGE_PATH+row.images[i].image);
                              imagesTmp.push({
                                file: base64,
                                score: null,
                                title:
                                  row.images[i].id,
                              });
                            }
                            setImages(imagesTmp);
                          }}>
                            <Iconify icon={'eva:more-vertical-fill'} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {loading && (
                   <TableRow>
                     <TableCell align="center" colSpan={10} sx={{ py: 3 }}>
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
                      <TableCell colSpan={10} />
                    </TableRow>
                  )}
                  {productlist.length === 0 && !loading && !isNotFound && (
                   <TableRow>
                     <TableCell align="center" colSpan={10} sx={{ py: 3 }}>
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
                      <TableCell align="center" colSpan={10} sx={{ py: 3 }}>
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
            count={productlist.length}
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
          initialValues={edit ? actionProduct : { title: '', description:'', categories:[] }}
          validate={(values) => {
            const errors = {};
            if (!values.title) {
              errors.title = 'Required';
            }
            return errors;
          }}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              const image = images.map(im=>({file:im.file}))
              if(edit) {
                const dat= {...values, features};
                if(image.length) {
                  dat.image = image
                }
                await updateProduct(actionProduct.id, dat)
                success("Product updated successfully")
              } else {
                await addProduct({...values, image, features});
                success("Product added successfully")
              }
                getData();

            handleClose();

            } catch (e) {
              if(edit) {
                error(e.message || "Failed to update product")
              } else {
                error(e.message || "Failed to add product")
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
              <DialogTitle>{edit ? "Edit Product" : "Add Product"}</DialogTitle>
              <DialogContent>
                {/* <DialogContentText>
            To subscribe to this website, please enter your name address here. We
            will send updates occasionally.
          </DialogContentText> */}
                <TextField
                  autoFocus
                  margin="dense"
                  id="name"
                  label="Product name"
                  type="text"
                  fullWidth
                  name="title"
                  variant="standard"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.title}
                />
                {errors.title && touched.title && errors.title}
                  <TextField
                    autoFocus
                    margin="dense"
                    id="name"
                    label="Product Description"
                    type="text"
                    fullWidth
                    name="description"
                    variant="standard"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.description}
                  />
                {errors.description && touched.description && errors.description}
                <TextField
                  autoFocus
                  margin="dense"
                  id="name"
                  label="Regular Price"
                  type="number"
                  fullWidth
                  name="regular_price"
                  variant="standard"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.regular_price}
                />
              {errors.regular_price && touched.regular_price && errors.regular_price}
                <TextField
                  autoFocus
                  margin="dense"
                  id="name"
                  label="Discounted Price"
                  fullWidth
                  type="number"
                  name="discount_price"
                  variant="standard"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.discount_price}
                />
              {errors.discount_price && touched.discount_price && errors.discount_price}
                  <TextField
                    autoFocus
                    margin="dense"
                    id="name"
                    label="Quantity"
                    fullWidth
                    type="number"
                    name="quantity"
                    variant="standard"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.quantity}
                  />
                {errors.quantity && touched.quantity && errors.quantity}

                <FormControl style={{width: "100%", marginTop: '0.5rem'}}> 
                  <InputLabel htmlFor='selected-brand'>Brand</InputLabel>
                  <Select value={values.brand_id}
                          // onChange={(e) => this.onLanguageChange(e.target.value)}
                    onChange={handleChange}
                    onBlur={handleBlur}
                          inputProps={{
                              name: 'brand_id',
                              id: 'selected-brand',
                          }}>
                            {brandlist.map(brand => (<MenuItem value={brand.value}>{brand.label}</MenuItem>))}
                          
                  </Select>
                </FormControl>
                {errors.brand_id && touched.brand_id && errors.brand_id}

                <FormControl style={{width: "100%", marginTop: '0.5rem'}}> 
                  <InputLabel htmlFor='selected-brand'>Categories</InputLabel>
                  <Select value={values.categories}
                          // onChange={(e) => this.onLanguageChange(e.target.value)}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    multiple
                          inputProps={{
                              name: 'categories',
                              id: 'selected-brand',
                          }}>
                            {categorylist.map(category => (<MenuItem value={category.value}>{category.label}</MenuItem>))}
                          
                  </Select>
                </FormControl>
                {errors.categories && touched.categories && errors.categories}
                <FormControl style={{width: "100%", marginTop: '0.5rem'}}> 
                  Images
        <Input type="file" id="images" onChange={handleSelectedFile} multiple />
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
                <FormControl style={{width: "100%", marginTop: '0.5rem'}}> 
                Features
                </FormControl>
                  {features.map((ft, index) => (
<>
                    <TextField
                    autoFocus
                    margin="dense"
                    label="Name"
                    type="text"
                    name="quantity"
                    variant="standard"
                    onChange={(e) => {
                      setFeatures([
                            ...features.slice(0, index),
                            {...features[index], name:e.target.value},
                            ...features.slice(index + 1)
                          ])
                    }}
                    onBlur={handleBlur}
                    value={ft.name}
                    />
                    <TextField
                    autoFocus
                    margin="dense"
                    label="Description"
                    type="text"
                    name="description"
                    variant="standard"
                    onChange={(e) => {
                      setFeatures([
                            ...features.slice(0, index),
                            {...features[index], description:e.target.value},
                            ...features.slice(index + 1)
                          ])
                    }}
                    onBlur={handleBlur}
                    value={ft.description}
                    /></>
                  ))
                  }
                <FormControl style={{width: "100%", marginTop: '0.5rem'}}> 
              <Button
                onClick={() => {
                  setFeatures([...features, {name: "", description: ""}])
                }}
              >
                Add Features
              </Button>
        </FormControl>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button disabled={isSubmitting} type='submit'>{edit ? "Update" : "Add"}</Button>
              </DialogActions>
            </form>
          )}
        </Formik>
      </Dialog>
    </>
  );
}
